import { describe, expect, it } from "vitest";
import { fichaEmpresaSchema, nombreCompromiso } from "./ficha.schema";

// Respuesta real de GET /companies/{id} (back_exogena), recortada. Incluye los casos que ya
// rompieron la ficha: full_name en null y service_type como texto.
const respuesta = {
  company: {
    id: "00f609d7-476f-426f-a238-a234e546da2d",
    group: { id: "8f5152ff", name: "Pollito Frisby", is_active: true },
    display_name: "Comercializadora Andina SAS",
    trade_name: "Frisby",
    contact_name: "Allison Perez",
    contact_email: "allison@correo.com",
    contact_phone: "+573507938174",
    notes: "a ver",
    nit: "111111111",
    check_digit: "9",
    legal_name: "Comercializadora Andina SAS",
    rut_id: "rut-1",
    rut_updated_at: "2026-09-12",
    is_active: true,
  },
  status: "active",
  rut_date_unknown: false,
  group_companies: [],
  engagements: [
    {
      id: "5d2f0cb3",
      service_type: "exogena",
      fiscal_year: 2025,
      due_date: "2026-05-15T23:59:00-05:00",
      status: "por_iniciar",
      partner: { user_id: "u-socio", full_name: null },
      manager: { user_id: "u-gerente", full_name: null },
    },
  ],
  users: [],
};

describe("fichaEmpresaSchema", () => {
  it("acepta la respuesta real de exógena", () => {
    const resultado = fichaEmpresaSchema.safeParse(respuesta);
    expect(resultado.error?.issues).toBeUndefined();
  });

  it("nombra el compromiso: «Exógena» hoy, «Obligación · Tipo» en los anteriores", () => {
    const [nuevo] = fichaEmpresaSchema.parse(respuesta).engagements;
    expect(nombreCompromiso(nuevo)).toBe("Exógena");
    expect(
      nombreCompromiso({
        ...nuevo,
        obligation: { id: "o", name: "Información exógena" },
        service_type: { id: "t", name: "Elaboración" },
      }),
    ).toBe("Información exógena · Elaboración");
  });
});
