import { z } from "zod";

export const NOTAS_MAX = 2000;

export const telefonoValido = (v: string) => /^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 7;
export const MENSAJE_TELEFONO = "Revisa el teléfono: solo números, espacios y el indicativo (ej. +57 310 555 4321).";

/**
 * Parte un nombre completo en nombres y apellidos para la API (first_name / last_name).
 * Heurística: 2 palabras = 1 + 1; 3 palabras = 1 + 2; 4 o más = 2 + resto.
 */
export function dividirNombre(completo: string): { nombres: string; apellidos: string } {
  const palabras = completo.trim().split(/\s+/).filter(Boolean);
  const corte = palabras.length >= 4 ? 2 : 1;
  return { nombres: palabras.slice(0, corte).join(" "), apellidos: palabras.slice(corte).join(" ") };
}

// Datos que el usuario diligencia en el paso «Datos del RUT». Todos obligatorios salvo las notas.
// Al crear el cliente (POST /clients): nombre comercial y notas van en `organization`
// (trade_name, notes); contacto, correo y teléfono, en `users` como el contacto principal.
export const organizacionSchema = z.object({
  nombreComercial: z.string().trim().min(1, "Escribe el nombre comercial."),
  contactoPrincipal: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del contacto principal.")
    .refine((v) => dividirNombre(v).apellidos.length > 0, {
      message: "Escribe nombre y apellido del contacto principal.",
    }),
  correoContacto: z
    .string()
    .trim()
    .min(1, "Escribe el correo de contacto.")
    .pipe(z.email("Revisa el correo: debe tener la forma nombre@empresa.com.")),
  telefono: z
    .string()
    .trim()
    .min(1, "Escribe el teléfono.")
    .refine(telefonoValido, { message: MENSAJE_TELEFONO }),
  notas: z.string().trim().max(NOTAS_MAX, `Las notas admiten hasta ${NOTAS_MAX} caracteres.`),
});

export type Organizacion = z.infer<typeof organizacionSchema>;
export type CampoOrganizacion = keyof Organizacion;

export const ORGANIZACION_VACIA: Organizacion = {
  nombreComercial: "",
  contactoPrincipal: "",
  correoContacto: "",
  telefono: "",
  notas: "",
};
