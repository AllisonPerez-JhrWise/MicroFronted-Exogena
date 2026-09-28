import { z } from "zod";

/** NIT sin dígito de verificación. */
export const NIT_DIGITOS = 9;
export const RUT_MAX_BYTES = 25 * 1024 * 1024;

// PROVISIONAL: respuesta supuesta de la validación del RUT hasta tener el contrato real.
// Se usará para prellenar el paso «Datos del RUT».
export const rutValidadoSchema = z.object({
  nit: z.string(),
  digitoVerificacion: z.string(),
  razonSocial: z.string(),
});

export type RutValidado = z.infer<typeof rutValidadoSchema>;

export interface ValidarRutParams {
  nit: string;
  archivo: File;
}
