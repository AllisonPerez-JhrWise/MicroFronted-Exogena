import { z } from "zod";

// Una variable declarada pero vacía (`NOMBRE=`) cuenta como no definida.
const opcional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

// Las variables NEXT_PUBLIC_* se incrustan en el bundle en build time, por eso
// se leen una a una (Next no reemplaza accesos dinámicos a process.env).
const envSchema = z.object({
  /** SOLO desarrollo local: access token de Cognito mientras el host no entregue la sesión. */
  NEXT_PUBLIC_DEV_TOKEN: opcional(z.string().trim()),
  /** Organización (firma) activa: se envía como X-Organization-Id. */
  NEXT_PUBLIC_ORGANIZATION_ID: opcional(z.uuid()),
  NEXT_PUBLIC_BASE_PATH: z.string().default(""),
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_RUT_API_BASE_URL: z.url(),
  /** "false" = no se llama a la API del RUT; se usan datos de ejemplo (solo mientras la API no exista). */
  NEXT_PUBLIC_RUT_VALIDACION: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_DEV_TOKEN: process.env.NEXT_PUBLIC_DEV_TOKEN,
  NEXT_PUBLIC_ORGANIZATION_ID: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_RUT_API_BASE_URL: process.env.NEXT_PUBLIC_RUT_API_BASE_URL,
  NEXT_PUBLIC_RUT_VALIDACION: process.env.NEXT_PUBLIC_RUT_VALIDACION,
  NEXT_PUBLIC_API_TIMEOUT_MS: process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
});

if (!parsed.success) {
  throw new Error(
    `Variables de entorno inválidas:\n${z.prettifyError(parsed.error)}\nRevisa .env.local (ver .env.example).`,
  );
}

export const env = {
  basePath: parsed.data.NEXT_PUBLIC_BASE_PATH,
  apiBaseUrl: parsed.data.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, ""),
  rutApiBaseUrl: parsed.data.NEXT_PUBLIC_RUT_API_BASE_URL.replace(/\/+$/, ""),
  rutValidacionHabilitada: parsed.data.NEXT_PUBLIC_RUT_VALIDACION === "true",
  apiTimeoutMs: parsed.data.NEXT_PUBLIC_API_TIMEOUT_MS,
  devToken: parsed.data.NEXT_PUBLIC_DEV_TOKEN,
  organizationId: parsed.data.NEXT_PUBLIC_ORGANIZATION_ID,
} as const;
