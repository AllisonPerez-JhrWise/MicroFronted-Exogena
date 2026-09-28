import { z } from "zod";

// PROVISIONAL: contrato supuesto hasta tener el del microservicio. Al recibirlo,
// solo deberían cambiar este archivo y api/clientes.service.ts.

export const ESTADOS_CLIENTE = ["ACTIVO", "INACTIVO", "RUT_POR_RENOVAR"] as const;
export const estadoClienteSchema = z.enum(ESTADOS_CLIENTE);
export type EstadoCliente = z.infer<typeof estadoClienteSchema>;

export const clienteSchema = z.object({
  id: z.string(),
  empresa: z.string(),
  nit: z.string(),
  grupo: z.string().nullable(),
  compromisosActivos: z.number().int().nonnegative(),
  /** Fecha del RUT vigente (YYYY-MM-DD); null si no se ha identificado. */
  rutActualizado: z.string().nullable(),
  /** Línea de apoyo bajo la fecha, p. ej. «Generado hace 14 meses». */
  rutNota: z.string().nullable(),
  estado: estadoClienteSchema,
});

export const clientesPageSchema = z.object({
  items: z.array(clienteSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
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
