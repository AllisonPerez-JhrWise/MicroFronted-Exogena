import { z } from "zod";

// Catálogo del paso «Compromisos» (back_exogena · GET /obligations y GET /obligations/{id}/service-types).
export const obligacionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  nature: z.enum(["tributaria", "servicio_recurrente"]),
  /** Si es true (tributaria), el vencimiento es obligatorio. */
  requires_due_date: z.boolean(),
});

export const tipoServicioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  /** Servicio (obligación + tipo): es lo que identifica el servicio del compromiso. */
  service_id: z.string(),
});

// PROVISIONAL: GET /partners aún no existe en back_exogena; ruta y campos supuestos.
export const socioSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Obligacion = z.infer<typeof obligacionSchema>;
export type TipoServicio = z.infer<typeof tipoServicioSchema>;
export type Socio = z.infer<typeof socioSchema>;

/**
 * Compromiso armado en el paso 3. Por ahora vive solo en memoria: crear compromisos
 * todavía no está disponible en back_exogena. Guarda los nombres para mostrarlos en la tabla.
 */
export interface Compromiso {
  /** Identificador local de la fila. */
  clave: string;
  obligacionId: string;
  obligacionNombre: string;
  tipoServicioNombre: string;
  serviceId: string;
  anioGravable: number;
  /** YYYY-MM-DD; null si la obligación no exige vencimiento y no se indicó. */
  vencimiento: string | null;
  socioId: string | null;
  socioNombre: string | null;
}
