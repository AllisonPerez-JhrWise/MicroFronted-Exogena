import { z } from "zod";
import { apiRequest } from "@/lib/http/api-client";
import { clientesPageSchema, type ClientesFiltros } from "../schemas/cliente.schema";
import { grupoSchema, nitCheckSchema, type SeleccionGrupo } from "../schemas/grupo.schema";
import { finDelDia, inicioDelDia, type Compromiso } from "../schemas/compromiso.schema";
import { fichaEmpresaSchema } from "../schemas/ficha.schema";
import type { Organizacion } from "../schemas/organizacion.schema";
import type { Rut } from "../schemas/rut.schema";
import { clienteCreadoSchema, type Usuario } from "../schemas/usuario.schema";

export interface ListarClientesParams extends ClientesFiltros {
  page: number;
  size: number;
}

export interface CrearClienteParams {
  /** Lectura del RUT en extracción: exógena la consulta allá con `rut_id`. */
  rut: Rut;
  organizacion: Organizacion;
  /** Grupo del catálogo o nuevo; null = la empresa no pertenece a un grupo. */
  grupo: SeleccionGrupo | null;
  compromisos: Compromiso[];
  usuarios: Usuario[];
}

const oNull = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

/** Cuerpo de POST /clients (back_exogena): todo el asistente en una sola petición. */
export function cuerpoCrearCliente({ rut, organizacion, grupo, compromisos, usuarios }: CrearClienteParams) {
  return {
    // Grupo existente (group_id) o nuevo (group_name); nunca ambos. Sin grupo, ninguno.
    ...(grupo?.tipo === "existente" && { group_id: grupo.id }),
    ...(grupo?.tipo === "nuevo" && { group_name: grupo.nombre.trim() }),
    // Exógena le pide el RUT a extracción (no confía en el navegador): solo viaja el id.
    rut_id: rut.id,
    // El contacto principal del paso 2 va aquí, no en `users`.
    organization: {
      trade_name: organizacion.nombreComercial,
      contact_name: organizacion.contactoPrincipal,
      contact_email: organizacion.correoContacto,
      contact_phone: organizacion.telefono,
      notes: oNull(organizacion.notas),
    },
    // Pasos 3 y 4 son opcionales: «Omitir» envía la lista vacía.
    // Todo compromiso es de exógena: no se envían obligación ni tipo de servicio.
    // Las fechas van con la zona horaria de Colombia (-05:00).
    engagements: compromisos.map((c) => ({
      fiscal_year: c.anioGravable,
      due_date: finDelDia(c.vencimiento),
      start_date: c.inicio ? inicioDelDia(c.inicio) : null,
      partner_user_id: c.socioId,
      manager_user_id: c.gerenteId,
    })),
    users: usuarios.map((u) => ({
      email: u.correo,
      first_name: u.nombres,
      last_name: u.apellidos,
      phone: oNull(u.celular),
      position: u.cargo,
    })),
  };
}

// Único lugar del feature que conoce las rutas y parámetros del microservicio.
export const clientesService = {
  /** Pantalla de clientes: una fila por empresa. */
  list: ({ empresa, nit, grupo, compromisosMin, compromisosMax, estados, page, size }: ListarClientesParams, signal?: AbortSignal) =>
    apiRequest("/companies", {
      schema: clientesPageSchema,
      query: {
        company: empresa,
        nit: nit?.replace(/\D/g, "") || undefined,
        group: grupo,
        engagements_min: compromisosMin,
        engagements_max: compromisosMax,
        status: estados?.length ? estados.join(",") : undefined,
        page,
        size,
      },
      signal,
    }),

  /** Ficha de la empresa. 404 si no existe o quien consulta no puede verla. */
  ficha: (id: string, signal?: AbortSignal) =>
    apiRequest(`/companies/${encodeURIComponent(id)}`, { schema: fichaEmpresaSchema, signal }),

  /** Paso 1: ¿el NIT ya está registrado? (listo; su interfaz espera mockup). */
  nitCheck: (nit: string, signal?: AbortSignal) =>
    apiRequest("/companies/nit-check", { schema: nitCheckSchema, query: { nit }, signal }),

  /** Catálogo de grupos (máximo 20). Sin `q`, todos; no distingue mayúsculas ni tildes. */
  grupos: (q: string, signal?: AbortSignal) =>
    apiRequest("/groups", { schema: z.array(grupoSchema), query: { q: q || undefined }, signal }),

  /** Crea la empresa (cliente) con su RUT, grupo, compromisos y usuarios. Si algo falla, no se guarda nada. */
  crear: (params: CrearClienteParams) =>
    apiRequest("/clients", { method: "POST", schema: clienteCreadoSchema, body: cuerpoCrearCliente(params) }),
};
