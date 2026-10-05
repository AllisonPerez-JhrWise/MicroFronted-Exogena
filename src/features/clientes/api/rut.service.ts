import { extractionApiRequest } from "@/lib/http/api-client";
import { rutValidadoSchema, type ValidarRutParams } from "../schemas/rut.schema";

// Subir y leer un RUT puede tardar más que una consulta normal.
const TIMEOUT_SUBIDA_MS = 120_000;

// Único lugar que conoce las rutas de extracción para el RUT.
// PENDIENTE (bloque 3): pasa a POST /ruts + GET /ruts/{id} con el contrato RutOut.
export const rutService = {
  validar: (params: ValidarRutParams) => {
    const datos = new FormData();
    datos.append("nit", params.nit);
    datos.append("rut", params.archivo);
    return extractionApiRequest("/rut/validar", {
      method: "POST",
      schema: rutValidadoSchema,
      body: datos,
      timeoutMs: TIMEOUT_SUBIDA_MS,
    });
  },
};
