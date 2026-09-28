import { apiRequest } from "@/lib/http/api-client";
import {
  formatoSchema,
  formatosPageSchema,
  type FormatosFilters,
} from "../schemas/formato.schema";

// Único lugar del feature que conoce las rutas del microservicio.
export const formatosService = {
  list: (filters: FormatosFilters, signal?: AbortSignal) =>
    apiRequest("/formatos", { schema: formatosPageSchema, query: { ...filters }, signal }),

  getById: (id: string, signal?: AbortSignal) =>
    apiRequest(`/formatos/${encodeURIComponent(id)}`, { schema: formatoSchema, signal }),
};
