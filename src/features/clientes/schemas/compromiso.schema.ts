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

/** Persona de la firma con un rol (GET /members?role=socio|gerente). */
export const personaEquipoSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  email: z.string(),
});

export type RolEquipo = "socio" | "gerente";
export type Obligacion = z.infer<typeof obligacionSchema>;
export type TipoServicio = z.infer<typeof tipoServicioSchema>;
export type PersonaEquipo = z.infer<typeof personaEquipoSchema>;

/**
 * Compromiso armado en el paso 3. Se envía en `engagements` de POST /clients.
 * Guarda los nombres solo para mostrarlos en la tabla.
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
  gerenteId: string | null;
  gerenteNombre: string | null;
}
