import { z } from "zod";
import { apiRequest } from "@/lib/http/api-client";
import { clienteExistenteSchema, nitCheckSchema, type ClienteExistente } from "../schemas/cliente-existente.schema";
import { clientesPageSchema, type ClientesFiltros } from "../schemas/cliente.schema";
import type { Compromiso } from "../schemas/compromiso.schema";
import type { Organizacion } from "../schemas/organizacion.schema";
import type { RutValidado } from "../schemas/rut.schema";
import { clienteCreadoSchema, type Usuario } from "../schemas/usuario.schema";

export interface ListarClientesParams extends ClientesFiltros {
  page: number;
  size: number;
}

export interface CrearClienteParams {
  rut: RutValidado;
  organizacion: Organizacion;
  /** Cliente existente (grupo) al que se asocia la empresa; null = cliente nuevo. */
  clienteExistente: ClienteExistente | null;
  compromisos: Compromiso[];
  usuarios: Usuario[];
}

const oNull = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

/** Cuerpo de POST /clients (back_exogena): todo el asistente en una sola petición. */
export function cuerpoCrearCliente({ rut, organizacion, clienteExistente, compromisos, usuarios }: CrearClienteParams) {
  return {
    client_id: clienteExistente?.id ?? null,
    rut: {
      nit: rut.nit,
      dv: rut.dv,
      person_type: rut.person_type,
      taxpayer_type: rut.taxpayer_type,
      ...(rut.person_type === "juridica"
        ? { legal_name: rut.legal_name }
        : { first_name: rut.first_name, last_name: rut.last_name }),
      address: rut.address,
      department_code: rut.department_code,
      city_code: rut.city_code,
      rut_email: rut.rut_email,
      rut_phone: rut.rut_phone,
      main_activity_code: rut.main_activity_code,
      tax_responsibilities: rut.tax_responsibilities.map((r) => r.code),
      rut_status: rut.rut_status,
      generated_at: rut.generated_at,
      rut_updated_at: rut.rut_updated_at,
    },
    // El contacto principal del paso 2 va aquí, no en `users`.
    organization: {
      trade_name: organizacion.nombreComercial,
      contact_name: organizacion.contactoPrincipal,
      contact_email: organizacion.correoContacto,
      contact_phone: organizacion.telefono,
      notes: oNull(organizacion.notas),
    },
    // Pasos 3 y 4 son opcionales: «Omitir» envía la lista vacía.
    engagements: compromisos.map((c) => ({
      service_id: c.serviceId,
      fiscal_year: c.anioGravable,
      due_date: c.vencimiento,
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

  /** Paso 1: ¿el NIT ya está registrado? (listo; su interfaz espera mockup). */
  nitCheck: (nit: string, signal?: AbortSignal) =>
    apiRequest("/companies/nit-check", { schema: nitCheckSchema, query: { nit }, signal }),

  /** Clientes activos por su nombre o el nombre/NIT de sus empresas (máximo 20). */
  buscar: (q: string, signal?: AbortSignal) =>
    apiRequest("/clients/search", { schema: z.array(clienteExistenteSchema), query: { q }, signal }),

  /** Crea cliente (o usa el existente), empresa, compromisos y usuarios. Si algo falla, no se guarda nada. */
  crear: (params: CrearClienteParams) =>
    apiRequest("/clients", { method: "POST", schema: clienteCreadoSchema, body: cuerpoCrearCliente(params) }),
};
