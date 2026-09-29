import { z } from "zod";

/** Cliente activo (cuenta o grupo) al que se puede asociar la empresa. GET /clients/search?q= */
export const clienteExistenteSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Cantidad de empresas del cliente. */
  companies: z.number(),
  contact_name: z.string().nullable(),
  contact_email: z.string().nullable(),
  contact_phone: z.string().nullable(),
});

export type ClienteExistente = z.infer<typeof clienteExistenteSchema>;

/** ¿El NIT ya está registrado en la organización? GET /companies/nit-check?nit= */
export const nitCheckSchema = z.object({
  exists: z.boolean(),
  company_id: z.string().nullable().optional(),
  client_id: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
});

export type NitCheck = z.infer<typeof nitCheckSchema>;
