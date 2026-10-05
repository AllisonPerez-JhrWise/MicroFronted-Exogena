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

/**
 * Miembros de la firma (Identidad · GET /organizacion/miembros). Socio y gerente NO son roles
 * de la persona sino del compromiso: para los dos selectores se ofrece la misma lista.
 */
const miembroSchema = z.object({
  membership_id: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string().nullable(),
    is_active: z.boolean(),
  }),
  status: z.enum(["active", "invited", "revoked"]),
  /** Roles GENERALES de la membresía (administrador, cliente…). */
  roles: z.array(z.string()),
});

export const miembrosSchema = z.object({
  total: z.number(),
  miembros: z.array(miembroSchema),
});

export type Miembro = z.infer<typeof miembroSchema>;

/** Persona que se puede elegir como socio o gerente. `id` es el `user.id` de Identidad. */
export interface PersonaEquipo {
  id: string;
  nombre: string;
  email: string;
}

export type Obligacion = z.infer<typeof obligacionSchema>;
export type TipoServicio = z.infer<typeof tipoServicioSchema>;

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
  /** Socio y gerente son obligatorios: back_exogena responde 422 si faltan. */
  socioId: string;
  socioNombre: string;
  gerenteId: string;
  gerenteNombre: string;
}
