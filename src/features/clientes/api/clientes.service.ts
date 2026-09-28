import { apiRequest } from "@/lib/http/api-client";
import { clientesPageSchema, type ClientesFiltros } from "../schemas/cliente.schema";
import { rutValidadoSchema, type ValidarRutParams } from "../schemas/rut.schema";

export interface ListarClientesParams extends ClientesFiltros {
  page: number;
  pageSize: number;
}

// Subir y leer un RUT de hasta 25 MB puede tardar más que una consulta normal.
const TIMEOUT_SUBIDA_MS = 120_000;

// Único lugar del feature que conoce las rutas y parámetros del microservicio (provisionales).
export const clientesService = {
  list: ({ estados, ...params }: ListarClientesParams, signal?: AbortSignal) =>
    apiRequest("/clientes", {
      schema: clientesPageSchema,
      query: { ...params, estado: estados?.length ? estados.join(",") : undefined },
      signal,
    }),

  validarRut: ({ nit, archivo }: ValidarRutParams) => {
    const datos = new FormData();
    datos.append("nit", nit);
    datos.append("rut", archivo);
    return apiRequest("/clientes/rut/validar", {
      method: "POST",
      schema: rutValidadoSchema,
      body: datos,
      timeoutMs: TIMEOUT_SUBIDA_MS,
    });
  },
};
