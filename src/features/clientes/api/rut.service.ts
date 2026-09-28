import { env } from "@/config/env";
import { rutApiRequest } from "@/lib/http/api-client";
import { rutValidadoSchema, type ValidarRutParams } from "../schemas/rut.schema";
import { validarRutSimulado } from "./rut.simulado";

// Subir y leer un RUT de hasta 25 MB puede tardar más que una consulta normal.
const TIMEOUT_SUBIDA_MS = 120_000;

// Único lugar que conoce las rutas de la API del RUT (provisionales).
export const rutService = {
  validar: (params: ValidarRutParams) => {
    if (!env.rutValidacionHabilitada) return validarRutSimulado(params);

    const datos = new FormData();
    datos.append("nit", params.nit);
    datos.append("rut", params.archivo);
    return rutApiRequest("/rut/validar", {
      method: "POST",
      schema: rutValidadoSchema,
      body: datos,
      timeoutMs: TIMEOUT_SUBIDA_MS,
    });
  },
};
