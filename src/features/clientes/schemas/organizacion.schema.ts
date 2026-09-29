import { z } from "zod";

export const NOTAS_MAX = 2000;

// Datos que el usuario diligencia en el paso «Datos del RUT». Todos obligatorios salvo las notas.
// Al crear el cliente (POST /clients): nombre comercial y notas van en `organization`
// (trade_name, notes); contacto, correo y teléfono, en `users` como el contacto principal.
export const organizacionSchema = z.object({
  nombreComercial: z.string().trim().min(1, "Escribe el nombre comercial."),
  contactoPrincipal: z.string().trim().min(1, "Escribe el nombre del contacto principal."),
  correoContacto: z
    .string()
    .trim()
    .min(1, "Escribe el correo de contacto.")
    .pipe(z.email("Revisa el correo: debe tener la forma nombre@empresa.com.")),
  telefono: z
    .string()
    .trim()
    .min(1, "Escribe el teléfono.")
    .refine((v) => /^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 7, {
      message: "Revisa el teléfono: solo números, espacios y el indicativo (ej. +57 310 555 4321).",
    }),
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
