import { extractionApiRequest } from "@/lib/http/api-client";
import { rutSchema, type CargarRutParams } from "../schemas/rut.schema";

// Subir un archivo de hasta 10 MB puede tardar más que una consulta normal.
const TIMEOUT_SUBIDA_MS = 120_000;

// Único lugar que conoce las rutas de extracción para el RUT. Extracción responde sin sobre.
export const rutService = {
  /** POST /ruts (multipart): responde 202 con la lectura en `pending`. */
  cargar: ({ nit, archivo, companyId }: CargarRutParams) => {
    const datos = new FormData();
    datos.append("file", archivo);
    datos.append("nit", nit); // texto: nunca convertir a número (conserva ceros a la izquierda)
    if (companyId) datos.append("company_id", companyId);
    return extractionApiRequest("/ruts", {
      method: "POST",
      schema: rutSchema,
      body: datos,
      timeoutMs: TIMEOUT_SUBIDA_MS,
    });
  },

  /** GET /ruts/{id}: estado y datos de la lectura. */
  obtener: (id: string, signal?: AbortSignal) =>
    extractionApiRequest(`/ruts/${encodeURIComponent(id)}`, { schema: rutSchema, signal }),
};
