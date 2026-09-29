import { apiRequest } from "@/lib/http/api-client";
import { clientesPageSchema, type ClientesFiltros } from "../schemas/cliente.schema";

export interface ListarClientesParams extends ClientesFiltros {
  page: number;
  pageSize: number;
}

// Único lugar del feature que conoce las rutas y parámetros del microservicio.
export const clientesService = {
  // PENDIENTE: GET /clients aún no existe en back_exogena. Ruta, parámetros y esquema son
  // provisionales; ajustarlos cuando se publique (la tabla muestra error mientras tanto).
  list: ({ estados, ...params }: ListarClientesParams, signal?: AbortSignal) =>
    apiRequest("/clients", {
      schema: clientesPageSchema,
      query: { ...params, estado: estados?.length ? estados.join(",") : undefined },
      signal,
    }),
};
