import { z } from "zod";

/** Grupo del catálogo de la firma: junta varias empresas de un mismo cliente. GET /groups?q= */
export const grupoSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_active: z.boolean(),
  /** Cantidad de empresas del grupo. */
  companies: z.number(),
});

export type Grupo = z.infer<typeof grupoSchema>;

/**
 * Grupo elegido en el asistente: uno del catálogo (se envía `group_id`) o uno nuevo
 * (se envía `group_name` y el servicio lo agrega al crear el cliente). null = sin grupo.
 */
export type SeleccionGrupo =
  | { tipo: "existente"; id: string; nombre: string; empresas?: number }
  | { tipo: "nuevo"; nombre: string };

/** ¿El NIT ya está registrado? GET /companies/nit-check?nit= */
export const nitCheckSchema = z.object({
  exists: z.boolean(),
  company_id: z.string().nullable().optional(),
  group_id: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
});

export type NitCheck = z.infer<typeof nitCheckSchema>;

/** Compara nombres como el servicio: sin mayúsculas, tildes ni espacios de más. */
export function normalizarNombre(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
