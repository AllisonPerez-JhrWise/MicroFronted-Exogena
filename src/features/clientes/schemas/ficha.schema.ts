import { z } from "zod";
import { estadoClienteSchema } from "./cliente.schema";

// Ficha de la empresa: back_exogena · GET /companies/{id}.
// Solo se declaran los campos que usa la pantalla; el resto se ignora.

const personaSchema = z.object({ user_id: z.string(), full_name: z.string() });

export const compromisoFichaSchema = z.object({
  id: z.string(),
  obligation: z.object({ id: z.string(), name: z.string() }),
  service_type: z.object({ id: z.string(), name: z.string() }),
  fiscal_year: z.number(),
  due_date: z.string().nullable(),
  /** por_iniciar, en_curso, cerrado… (se muestra aunque llegue un valor nuevo). */
  status: z.string(),
  partner: personaSchema.nullable(),
  manager: personaSchema.nullable(),
});

export const empresaGrupoSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  nit: z.string(),
  check_digit: z.string().nullable().optional(),
  dv: z.string().nullable().optional(),
  status: estadoClienteSchema,
});

export const fichaEmpresaSchema = z.object({
  company: z.object({
    id: z.string(),
    group: z.object({ id: z.string(), name: z.string() }).nullable(),
    display_name: z.string(),
    trade_name: z.string().nullable(),
    contact_name: z.string().nullable(),
    contact_email: z.string().nullable(),
    contact_phone: z.string().nullable(),
    nit: z.string(),
    check_digit: z.string().nullable().optional(),
    dv: z.string().nullable().optional(),
    legal_name: z.string().nullable().optional(),
    /** Texto del RUT, p. ej. «Persona jurídica». */
    taxpayer_type: z.string().nullable().optional(),
    /** Lectura del RUT en extracción; el detalle (dirección, CIIU, casilla 53…) vive allá. */
    rut_id: z.string().nullable().optional(),
    rut_updated_at: z.string().nullable(),
  }),
  status: estadoClienteSchema,
  rut_date_unknown: z.boolean(),
  group_companies: z.array(empresaGrupoSchema),
  engagements: z.array(compromisoFichaSchema),
});

export type FichaEmpresa = z.infer<typeof fichaEmpresaSchema>;
export type CompromisoFicha = z.infer<typeof compromisoFichaSchema>;
export type EmpresaGrupo = z.infer<typeof empresaGrupoSchema>;
