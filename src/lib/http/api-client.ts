import type { z } from "zod";
import { env } from "@/config/env";
import { ApiError } from "./api-error";

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions<TSchema extends z.ZodType> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Esquema con el que se valida la respuesta del microservicio. */
  schema: TSchema;
  query?: Record<string, QueryValue>;
  /** Objeto que se envía como JSON, o FormData para subir archivos. */
  body?: unknown;
  headers?: HeadersInit;
  /** Sobrescribe el timeout global (p. ej. para subidas de archivos grandes). */
  timeoutMs?: number;
  signal?: AbortSignal;
}

// Punto único para inyectar cabeceras comunes (p. ej. el token que entregue el host).
let headersProvider: () => HeadersInit | Promise<HeadersInit> = () => ({});

export function setHeadersProvider(provider: typeof headersProvider) {
  headersProvider = provider;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${env.apiBaseUrl}/${path.replace(/^\/+/, "")}`);
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

export async function apiRequest<TSchema extends z.ZodType>(
  path: string,
  { method = "GET", schema, query, body, headers, signal, timeoutMs = env.apiTimeoutMs }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const timeout = AbortSignal.timeout(timeoutMs);
  // Con FormData el navegador define el Content-Type (con su boundary).
  const esFormulario = body instanceof FormData;
  const finalSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal: finalSignal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !esFormulario && { "Content-Type": "application/json" }),
        ...(await headersProvider()),
        ...headers,
      },
      body: esFormulario ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (timeout.aborted) {
      throw new ApiError("El microservicio no respondió a tiempo", "timeout");
    }
    // Cancelaciones de React Query (desmontaje, refetch) se propagan tal cual.
    if (signal?.aborted) throw error;
    throw new ApiError("No fue posible conectar con el microservicio", "network");
  }

  const data = await readBody(response);
  const requestId =
    response.headers.get("x-request-id") ?? response.headers.get("x-correlation-id") ?? undefined;

  if (!response.ok) {
    throw new ApiError(`Error ${response.status} en ${method} ${path}`, "http", response.status, data, requestId);
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(
      `La respuesta de ${method} ${path} no cumple el contrato esperado`,
      "validation",
      response.status,
      result.error.issues,
      requestId,
    );
  }
  return result.data;
}
