import { apiRequest } from "@/lib/http/api-client";
import { clientesPageSchema, type ClientesFiltros } from "../schemas/cliente.schema";

export interface ListarClientesParams extends ClientesFiltros {
  page: number;
  pageSize: number;
}

// Único lugar del feature que conoce las rutas y parámetros del microservicio (provisionales).
export const clientesService = {
  list: ({ estados, ...params }: ListarClientesParams, signal?: AbortSignal) =>
    apiRequest("/clientes", {
      schema: clientesPageSchema,
      query: { ...params, estado: estados?.length ? estados.join(",") : undefined },
      signal,
    }),
};
