import { z } from "zod";

/** NIT sin dígito de verificación. */
export const NIT_DIGITOS = 9;
export const RUT_MAX_BYTES = 25 * 1024 * 1024;

// PROVISIONAL: respuesta supuesta de la API del RUT al validar el PDF, hasta tener el contrato real.
// Alimenta el paso «Datos del RUT» (panel de solo lectura).
const codigoDescripcionSchema = z.object({
  codigo: z.string(),
  descripcion: z.string(),
});

export const rutValidadoSchema = z.object({
  /** Si el NIT digitado coincide con el que trae el PDF. */
  nitCoincide: z.boolean(),
  nit: z.string(),
  digitoVerificacion: z.string(),
  razonSocial: z.string(),
  tipoPersona: z.enum(["JURIDICA", "NATURAL"]),
  direccion: z.string().nullable(),
  ciudad: z.string().nullable(),
  departamento: z.string().nullable(),
  correo: z.string().nullable(),
  actividadPrincipal: codigoDescripcionSchema.nullable(),
  responsabilidades: z.array(codigoDescripcionSchema),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
  /** Fecha de actualización del RUT (YYYY-MM-DD). */
  actualizado: z.string().nullable(),
});

export type RutValidado = z.infer<typeof rutValidadoSchema>;

export interface ValidarRutParams {
  nit: string;
  archivo: File;
}
