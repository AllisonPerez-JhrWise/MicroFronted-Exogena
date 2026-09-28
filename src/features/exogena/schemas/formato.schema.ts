import { z } from "zod";

// EJEMPLO: ajustar al contrato real que exponga el microservicio.
export const formatoSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),
  version: z.number(),
  vigencia: z.number(),
});

export const formatosPageSchema = z.object({
  items: z.array(formatoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type Formato = z.infer<typeof formatoSchema>;
export type FormatosPage = z.infer<typeof formatosPageSchema>;

export interface FormatosFilters {
  vigencia?: number;
  page?: number;
  pageSize?: number;
}
