import { z } from "zod";

/** NIT sin dígito de verificación. */
export const NIT_DIGITOS = 9;
export const RUT_MAX_BYTES = 25 * 1024 * 1024;

// PROVISIONAL: respuesta supuesta de la API del RUT al validar el PDF, hasta tener su contrato.
// Los nombres siguen el bloque `rut` de POST /clients (back_exogena) para enviarlo tal cual;
// los *_name / *_description son solo para mostrar en el paso «Datos del RUT».
const responsabilidadSchema = z.object({
  code: z.string(),
  description: z.string(),
});

export const rutValidadoSchema = z.object({
  /** Si el NIT digitado coincide con el que trae el PDF. */
  nit_matches: z.boolean(),
  nit: z.string(),
  dv: z.string(),
  person_type: z.enum(["juridica", "natural"]),
  /** Razón social (persona jurídica). */
  legal_name: z.string().nullable(),
  /** Nombres y apellidos (persona natural). */
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  address: z.string().nullable(),
  department_code: z.string().nullable(),
  department_name: z.string().nullable(),
  city_code: z.string().nullable(),
  city_name: z.string().nullable(),
  rut_email: z.string().nullable(),
  main_activity_code: z.string().nullable(),
  main_activity_description: z.string().nullable(),
  tax_responsibilities: z.array(responsabilidadSchema),
  rut_status: z.enum(["activo", "suspendido", "cancelado"]),
  /** Fecha de actualización del RUT (YYYY-MM-DD). */
  rut_updated_at: z.string().nullable(),
});

export type RutValidado = z.infer<typeof rutValidadoSchema>;

/** Nombre con el que se identifica al cliente: razón social o nombres y apellidos. */
export function nombreDelRut(rut: RutValidado): string {
  return rut.legal_name ?? [rut.first_name, rut.last_name].filter(Boolean).join(" ");
}

export interface ValidarRutParams {
  nit: string;
  archivo: File;
}
