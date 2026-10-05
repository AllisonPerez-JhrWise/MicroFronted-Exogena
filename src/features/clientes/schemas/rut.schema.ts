import { z } from "zod";

// RUT según extracción (wise-extraccion), dueña del RUT: POST /ruts y GET /ruts/{id} → RutOut.
// Todas las llaves vienen siempre; lo no leído llega en null y las listas en [].
// Solo se declara lo que usa el front: zod descarta el resto sin fallar.

/** NIT sin dígito de verificación: solo dígitos, de 6 a 10. Siempre como texto (conserva ceros). */
export const NIT_MIN = 6;
export const NIT_MAX = 10;
export const nitValido = (nit: string) => /^\d+$/.test(nit) && nit.length >= NIT_MIN && nit.length <= NIT_MAX;

export const RUT_MAX_BYTES = 10 * 1024 * 1024;
export const RUT_TIPOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const RUT_EXTENSIONES = [".pdf", ".jpg", ".jpeg", ".png", ".webp"] as const;

const responsabilidadSchema = z.object({
  /** Código de la casilla 53, sin cero a la izquierda: "5". */
  code: z.string(),
  description: z.string(),
});

export const ESTADOS_LECTURA = ["pending", "read", "failed"] as const;
export type EstadoLectura = (typeof ESTADOS_LECTURA)[number];

export const rutSchema = z.object({
  id: z.string(),
  company_id: z.string().nullable(),
  status: z.enum(ESTADOS_LECTURA),
  error_code: z
    .enum(["unrecognized_document", "unreadable_document", "incomplete_reading", "reading_failed"])
    .nullable(),
  /** Frase para el usuario, en español: se muestra tal cual. */
  error_message: z.string().nullable(),
  /** NIT que digitó el usuario. */
  typed_nit: z.string(),
  /** NIT y dígito de verificación leídos del documento. */
  nit: z.string().nullable(),
  check_digit: z.string().nullable(),
  /** null mientras la lectura no esté en `read`. */
  nit_matches: z.boolean().nullable(),
  /** Frase para mostrar si el NIT no coincide. */
  nit_warning: z.string().nullable(),
  person_type: z.enum(["natural_person", "legal_entity"]).nullable(),
  legal_name: z.string().nullable(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  second_last_name: z.string().nullable(),
  trade_name: z.string().nullable(),
  /** Texto del RUT, p. ej. «Persona jurídica». */
  taxpayer_type: z.string().nullable(),
  address: z.string().nullable(),
  department: z.string().nullable(),
  department_code: z.string().nullable(),
  city: z.string().nullable(),
  city_code: z.string().nullable(),
  country: z.string().nullable(),
  rut_email: z.string().nullable(),
  rut_phone: z.string().nullable(),
  main_activity_code: z.string().nullable(),
  main_activity_description: z.string().nullable(),
  /** YYYY-MM-DD */
  generated_at: z.string().nullable(),
  rut_updated_at: z.string().nullable(),
  rut_status: z.enum(["active", "suspended", "cancelled"]).nullable(),
  tax_responsibilities: z.array(responsabilidadSchema),
  /** Advertencias de la lectura, en español: se muestran. */
  warnings: z.array(z.string()),
});

export type Rut = z.infer<typeof rutSchema>;

export const ETIQUETA_LECTURA: Record<EstadoLectura, string> = {
  pending: "Pendiente",
  read: "Leída",
  failed: "Con errores",
};

export const ETIQUETA_TIPO_PERSONA: Record<NonNullable<Rut["person_type"]>, string> = {
  natural_person: "Persona natural",
  legal_entity: "Persona jurídica",
};

const ETIQUETA_ESTADO_RUT: Record<NonNullable<Rut["rut_status"]>, string> = {
  active: "Activo",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

export const etiquetaEstadoRut = (estado: Rut["rut_status"]) => (estado ? ETIQUETA_ESTADO_RUT[estado] : "Sin identificar");

/** Nombre con el que se identifica al cliente: razón social o nombres y apellidos. */
export function nombreDelRut(rut: Rut): string {
  return (
    rut.legal_name ??
    [rut.first_name, rut.middle_name, rut.last_name, rut.second_last_name].filter(Boolean).join(" ")
  );
}

/** La lectura permite continuar: leída y con el NIT coincidente. */
export const rutListo = (rut: Rut) => rut.status === "read" && rut.nit_matches === true;

export interface CargarRutParams {
  nit: string;
  archivo: File;
  /** Vacío al crear un cliente nuevo. */
  companyId?: string;
}
