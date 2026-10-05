import type { z } from "zod";
import { env } from "@/config/env";
import { ApiError } from "./api-error";

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions<TSchema extends z.ZodType> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Esquema con el que se valida `data` de la respuesta del microservicio. */
  schema: TSchema;
  query?: Record<string, QueryValue>;
  /** Objeto que se envía como JSON, o FormData para subir archivos. */
  body?: unknown;
  headers?: HeadersInit;
  /** Sobrescribe el timeout global (p. ej. para subidas de archivos grandes). */
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Cabeceras comunes a todas las peticiones. Las APIs exigen en cada una:
 *
 *   Authorization: Bearer <access token de Cognito>   (nunca el id token)
 *   X-Organization-Id: <uuid de la organización activa>
 *
 * Hoy se configuran en `app/providers.tsx` con NEXT_PUBLIC_DEV_TOKEN y
 * NEXT_PUBLIC_ORGANIZATION_ID: el token de `.env.local` es SOLO para desarrollo local.
 * Cuando el host entregue la sesión, se reemplaza por el token y la organización del host.
 */
let headersProvider: () => HeadersInit | Promise<HeadersInit> = () => ({});

export function setHeadersProvider(provider: typeof headersProvider) {
  headersProvider = provider;
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${baseUrl}/${path.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}

async function readBody(response: Response) {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

/** Sobre del microservicio: { ok, message, data } en éxito; { ok: false, code, message, details } en error. */
interface Sobre {
  ok: boolean;
  message?: string;
  data?: unknown;
  code?: string;
  details?: unknown;
}

function esSobre(valor: unknown): valor is Sobre {
  return typeof valor === "object" && valor !== null && typeof (valor as Sobre).ok === "boolean";
}

function nuevoRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Crea el cliente de un microservicio: todos comparten timeout, errores y validación de contrato. */
export function crearClienteApi(baseUrl: string) {
  return <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) =>
    request(baseUrl, path, options);
}

/** Microservicio de clientes (back_exogena). */
export const apiRequest = crearClienteApi(env.apiBaseUrl);

/** Extracción (wise-extraccion): carga y lectura del RUT. Responde sin sobre. */
export const extractionApiRequest = crearClienteApi(env.extractionApiBaseUrl);

/** Identidad (wise-auth): personas y membresías de la firma. Responde sin sobre. */
export const identityApiRequest = crearClienteApi(env.identityApiBaseUrl);

async function request<TSchema extends z.ZodType>(
  baseUrl: string,
  path: string,
  { method = "GET", schema, query, body, headers, signal, timeoutMs = env.apiTimeoutMs }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const timeout = AbortSignal.timeout(timeoutMs);
  // Con FormData el navegador define el Content-Type (con su boundary).
  const esFormulario = body instanceof FormData;
  const finalSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  // Viaja al servicio y aparece en sus logs: es el identificador que se muestra para soporte.
  const idEnviado = nuevoRequestId();

  let response: Response;
  try {
    response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      signal: finalSignal,
      headers: {
        Accept: "application/json",
        "X-Request-ID": idEnviado,
        ...(body !== undefined && !esFormulario && { "Content-Type": "application/json" }),
        ...(await headersProvider()),
        ...headers,
      },
      body: esFormulario ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (timeout.aborted) {
      throw new ApiError("El microservicio no respondió a tiempo", "timeout", undefined, undefined, undefined, idEnviado);
    }
    // Cancelaciones de React Query (desmontaje, refetch) se propagan tal cual.
    if (signal?.aborted) throw error;
    throw new ApiError("No fue posible conectar con el microservicio", "network", undefined, undefined, undefined, idEnviado);
  }

  const cuerpo = await readBody(response);
  const requestId = response.headers.get("x-request-id") ?? idEnviado;
  const sobre = esSobre(cuerpo) ? cuerpo : null;

  if (!response.ok || sobre?.ok === false) {
    // Sin sobre (extracción, wise-comun) el error viene como { detail }: texto, o la lista
    // de campos inválidos en un 422. El código HTTP queda en el error para distinguir 404/409/503.
    const detail =
      !sobre && cuerpo && typeof cuerpo === "object" ? (cuerpo as { detail?: unknown }).detail : undefined;
    throw new ApiError(
      sobre?.message ?? (typeof detail === "string" ? detail : `Error ${response.status} en ${method} ${path}`),
      "http",
      response.status,
      sobre?.code,
      sobre ? sobre.details : detail !== undefined ? detail : cuerpo,
      requestId,
    );
  }

  // Si la respuesta viene en el sobre, el contrato se valida sobre `data`.
  const result = schema.safeParse(sobre ? sobre.data : cuerpo);
  if (!result.success) {
    throw new ApiError(
      `La respuesta de ${method} ${path} no cumple el contrato esperado`,
      "validation",
      response.status,
      undefined,
      result.error.issues,
      requestId,
    );
  }
  return result.data;
}
