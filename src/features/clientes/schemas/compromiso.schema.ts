import { z } from "zod";

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

/** Hoy todo compromiso es de exógena: se muestra como texto fijo. */
export const SERVICIO_COMPROMISO = "Exógena";

/** Zona horaria de Colombia: back_exogena exige las fechas del compromiso con zona. */
const ZONA_COLOMBIA = "-05:00";

/** Fecha elegida (YYYY-MM-DD) como fin de ese día en Colombia: «2026-05-15T23:59:00-05:00». */
export const finDelDia = (fecha: string) => `${fecha}T23:59:00${ZONA_COLOMBIA}`;

/** Fecha elegida (YYYY-MM-DD) como inicio de ese día en Colombia. */
export const inicioDelDia = (fecha: string) => `${fecha}T00:00:00${ZONA_COLOMBIA}`;

/**
 * Compromiso de exógena armado en el paso 3. Se envía en `engagements` de POST /clients
 * (sin obligación ni tipo de servicio). Guarda los nombres solo para mostrarlos en la tabla.
 */
export interface Compromiso {
  /** Identificador local de la fila; el año gravable no se repite entre compromisos. */
  clave: string;
  anioGravable: number;
  /** YYYY-MM-DD; obligatorio. Se envía con hora y zona (ver finDelDia). */
  vencimiento: string;
  /** YYYY-MM-DD; opcional. Hoy el paso no lo pide (no está en el mockup). */
  inicio: string | null;
  /** Socio y gerente son obligatorios: back_exogena responde 422 si faltan. */
  socioId: string;
  socioNombre: string;
  gerenteId: string;
  gerenteNombre: string;
}
