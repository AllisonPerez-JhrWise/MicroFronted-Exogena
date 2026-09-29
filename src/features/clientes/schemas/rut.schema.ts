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
  /** Tipo de contribuyente tal como lo trae el RUT, p. ej. «Persona jurídica». */
  taxpayer_type: z.string().nullable(),
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
  rut_phone: z.string().nullable(),
  main_activity_code: z.string().nullable(),
  main_activity_description: z.string().nullable(),
  tax_responsibilities: z.array(responsabilidadSchema),
  rut_status: z.enum(["activo", "suspendido", "cancelado"]),
  /** Fecha de generación del documento PDF (YYYY-MM-DD). La API la exige: sin ella no se puede crear. */
  generated_at: z.string().nullable(),
  /** Fecha de actualización del RUT (YYYY-MM-DD). */
  rut_updated_at: z.string().nullable(),
});

export type RutValidado = z.infer<typeof rutValidadoSchema>;

const PESOS_DV = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/** Dígito de verificación de un NIT (algoritmo DIAN, módulo 11). */
export function calcularDv(nit: string): string {
  const digitos = nit.replace(/\D/g, "").split("").reverse();
  const suma = digitos.reduce((acc, d, i) => acc + Number(d) * PESOS_DV[i], 0);
  const residuo = suma % 11;
  return String(residuo > 1 ? 11 - residuo : residuo);
}

/** Nombre con el que se identifica al cliente: razón social o nombres y apellidos. */
export function nombreDelRut(rut: RutValidado): string {
  return rut.legal_name ?? [rut.first_name, rut.last_name].filter(Boolean).join(" ");
}

export interface ValidarRutParams {
  nit: string;
  archivo: File;
}
