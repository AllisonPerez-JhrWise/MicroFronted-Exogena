import { z } from "zod";

// Datos que el usuario diligencia en el paso «Datos del RUT». Todos obligatorios salvo las notas.
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
  notas: z.string().trim(),
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
