import { z } from "zod";
import { MENSAJE_TELEFONO, telefonoValido } from "./organizacion.schema";

// Usuario del paso «Usuarios del cliente» (users de POST /clients). El contacto del paso 2
// aparece prellenado como usuario, pero se puede quitar: el contacto viaja aparte en `organization`.
export const usuarioSchema = z.object({
  nombres: z.string().trim().min(1, "Escribe los nombres."),
  apellidos: z.string().trim().min(1, "Escribe los apellidos."),
  correo: z
    .string()
    .trim()
    .min(1, "Escribe el correo.")
    .pipe(z.email("Revisa el correo: debe tener la forma nombre@empresa.com.")),
  celular: z
    .string()
    .trim()
    .refine((v) => v === "" || telefonoValido(v), { message: MENSAJE_TELEFONO }),
  cargo: z.string().trim().min(1, "Escribe el cargo en la empresa."),
});

export const MENSAJE_CARGO_PRINCIPAL = "Escribe el cargo del contacto principal.";

export type Usuario = z.infer<typeof usuarioSchema>;
export type CampoUsuario = keyof Usuario;

export const USUARIO_VACIO: Usuario = { nombres: "", apellidos: "", correo: "", celular: "", cargo: "" };

/** Respuesta de POST /clients ({ company, engagements, users }): solo lo necesario para confirmar. */
export const clienteCreadoSchema = z.object({
  company: z.object({
    id: z.string(),
    display_name: z.string(),
    group: z.object({ id: z.string(), name: z.string() }).nullable(),
  }),
});

export type ClienteCreado = z.infer<typeof clienteCreadoSchema>;
