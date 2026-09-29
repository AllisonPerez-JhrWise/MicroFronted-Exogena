import { z } from "zod";
import { apiRequest } from "@/lib/http/api-client";
import {
  obligacionSchema,
  personaEquipoSchema,
  tipoServicioSchema,
  type RolEquipo,
} from "../schemas/compromiso.schema";

export const catalogosService = {
  obligaciones: (signal?: AbortSignal) =>
    apiRequest("/obligations", { schema: z.array(obligacionSchema), signal }),

  /** Solo los tipos que tienen un servicio activo con esa obligación; puede venir vacío. */
  tiposServicio: (obligacionId: string, signal?: AbortSignal) =>
    apiRequest(`/obligations/${encodeURIComponent(obligacionId)}/service-types`, {
      schema: z.array(tipoServicioSchema),
      signal,
    }),

  /** Personas de la firma con ese rol y membresía activa (selectores de socio y gerente). */
  miembros: (role: RolEquipo, signal?: AbortSignal) =>
    apiRequest("/members", { schema: z.array(personaEquipoSchema), query: { role }, signal }),
};
