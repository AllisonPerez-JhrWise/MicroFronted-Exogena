import { z } from "zod";
import { apiRequest, identityApiRequest } from "@/lib/http/api-client";
import {
  miembrosSchema,
  obligacionSchema,
  tipoServicioSchema,
  type Miembro,
  type PersonaEquipo,
} from "../schemas/compromiso.schema";

/** Puede ser socio o gerente: membresía vigente, usuario activo y no usuario del cliente. */
const elegible = (m: Miembro) =>
  (m.status === "active" || m.status === "invited") && m.user.is_active && !m.roles.includes("cliente");

const aPersona = (m: Miembro): PersonaEquipo => ({
  id: m.user.id,
  nombre: m.user.full_name?.trim() || m.user.email,
  email: m.user.email,
});

export const catalogosService = {
  obligaciones: (signal?: AbortSignal) =>
    apiRequest("/obligations", { schema: z.array(obligacionSchema), signal }),

  /** Solo los tipos que tienen un servicio activo con esa obligación; puede venir vacío. */
  tiposServicio: (obligacionId: string, signal?: AbortSignal) =>
    apiRequest(`/obligations/${encodeURIComponent(obligacionId)}/service-types`, {
      schema: z.array(tipoServicioSchema),
      signal,
    }),

  /**
   * Personas de la firma para socio y gerente (Identidad). Una sola lista para los dos:
   * en Identidad son roles del compromiso, no de la persona, así que no se filtra por rol.
   */
  personasFirma: async (signal?: AbortSignal) => {
    const { miembros } = await identityApiRequest("/organizacion/miembros", {
      schema: miembrosSchema,
      query: { limite: 200 },
      signal,
    });
    return miembros
      .filter(elegible)
      .map(aPersona)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  },
};
