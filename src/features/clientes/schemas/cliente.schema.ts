import { z } from "zod";

// Pantalla de clientes: una fila por empresa (NIT). back_exogena · GET /companies.

export const ESTADOS_CLIENTE = ["activo", "inactivo", "rut_por_renovar"] as const;
export const estadoClienteSchema = z.enum(ESTADOS_CLIENTE);
export type EstadoCliente = z.infer<typeof estadoClienteSchema>;

export const clienteSchema = z.object({
  id: z.string(),
  client_id: z.string(),
  /** Nombre de la empresa (columna «Empresa»). */
  display_name: z.string(),
  trade_name: z.string().nullable(),
  nit: z.string(),
  dv: z.string().nullable(),
  /** Nombre del grupo; null si el cliente tiene una sola empresa. */
  group: z.string().nullable(),
  /** Compromisos por iniciar o en curso. */
  active_engagements: z.number().int().nonnegative(),
  /** Fecha de generación del RUT (YYYY-MM-DD). */
  rut_generated_at: z.string().nullable(),
  /** Fecha de actualización del RUT (YYYY-MM-DD). */
  rut_updated_at: z.string().nullable(),
  /** true = la fecha del RUT no se pudo identificar. */
  rut_date_unknown: z.boolean(),
  status: estadoClienteSchema,
});

export const clientesPageSchema = z.object({
  items: z.array(clienteSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  pages: z.number(),
});

export type Cliente = z.infer<typeof clienteSchema>;
export type ClientesPage = z.infer<typeof clientesPageSchema>;

export interface ClientesFiltros {
  empresa?: string;
  nit?: string;
  grupo?: string;
  compromisosMin?: number;
  compromisosMax?: number;
  estados?: EstadoCliente[];
}
