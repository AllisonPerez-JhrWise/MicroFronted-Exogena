import { describe, expect, it } from "vitest";
import type { Compromiso } from "../schemas/compromiso.schema";
import type { Organizacion } from "../schemas/organizacion.schema";
import type { Rut } from "../schemas/rut.schema";
import { cuerpoCrearCliente, type CrearClienteParams } from "./clientes.service";

// Contrato de POST /clients con back_exogena: si el cuerpo se arma mal, no se crea ningún cliente.

const rut = { id: "rut-1", nit: "900123456", check_digit: "8" } as Rut;

const organizacion: Organizacion = {
  nombreComercial: "Andina Comercial",
  contactoPrincipal: "Paula Córdoba",
  correoContacto: "paula@andina.com.co",
  telefono: "+57 310 555 4321",
  notas: "   ",
};

const compromiso: Compromiso = {
  clave: "2025",
  anioGravable: 2025,
  vencimiento: "2026-05-15",
  inicio: null,
  socioId: "u-socio",
  socioNombre: "Juan Restrepo",
  gerenteId: "u-gerente",
  gerenteNombre: "María Gómez",
};

const base: CrearClienteParams = { rut, organizacion, grupo: null, compromisos: [compromiso], usuarios: [] };

describe("cuerpoCrearCliente", () => {
  it("envía solo el rut_id: exógena le pide el RUT a extracción", () => {
    const cuerpo = cuerpoCrearCliente(base);
    expect(cuerpo.rut_id).toBe("rut-1");
    expect(cuerpo).not.toHaveProperty("rut");
  });

  it("arma el compromiso de exógena con fechas en hora de Colombia y sin servicio", () => {
    expect(cuerpoCrearCliente(base).engagements).toEqual([
      {
        fiscal_year: 2025,
        due_date: "2026-05-15T23:59:00-05:00",
        start_date: null,
        partner_user_id: "u-socio",
        manager_user_id: "u-gerente",
      },
    ]);
  });

  it("envía group_id o group_name, nunca los dos, y ninguno si no hay grupo", () => {
    const existente = cuerpoCrearCliente({ ...base, grupo: { tipo: "existente", id: "g-1", nombre: "Grupo Sacyr" } });
    expect(existente).toMatchObject({ group_id: "g-1" });
    expect(existente).not.toHaveProperty("group_name");

    const nuevo = cuerpoCrearCliente({ ...base, grupo: { tipo: "nuevo", nombre: "  Grupo Nuevo " } });
    expect(nuevo).toMatchObject({ group_name: "Grupo Nuevo" });
    expect(nuevo).not.toHaveProperty("group_id");

    const sinGrupo = cuerpoCrearCliente(base);
    expect(sinGrupo).not.toHaveProperty("group_id");
    expect(sinGrupo).not.toHaveProperty("group_name");
  });

  it("manda null en lo opcional vacío (notas y celular)", () => {
    const cuerpo = cuerpoCrearCliente({
      ...base,
      usuarios: [{ nombres: "Carlos", apellidos: "Mejía", correo: "c@x.co", celular: "", cargo: "Revisor fiscal" }],
    });
    expect(cuerpo.organization.notes).toBeNull();
    expect(cuerpo.users[0].phone).toBeNull();
  });
});
