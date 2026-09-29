import { z } from "zod";
import { apiRequest } from "@/lib/http/api-client";
import { obligacionSchema, socioSchema, tipoServicioSchema } from "../schemas/compromiso.schema";

export const catalogosService = {
  obligaciones: (signal?: AbortSignal) =>
    apiRequest("/obligations", { schema: z.array(obligacionSchema), signal }),

  /** Solo los tipos que tienen un servicio activo con esa obligación; puede venir vacío. */
  tiposServicio: (obligacionId: string, signal?: AbortSignal) =>
    apiRequest(`/obligations/${encodeURIComponent(obligacionId)}/service-types`, {
      schema: z.array(tipoServicioSchema),
      signal,
    }),

  // PROVISIONAL: GET /partners aún no existe; ajustar ruta y esquema cuando se publique.
  socios: (signal?: AbortSignal) => apiRequest("/partners", { schema: z.array(socioSchema), signal }),
};
