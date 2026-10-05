import { afterEach, describe, expect, it, vi } from "vitest";
import { catalogosService } from "./catalogos.service";

// Personas elegibles como socio o gerente (Identidad responde sin sobre { ok, data }).
const miembro = (nombre: string | null, email: string, extra: Record<string, unknown> = {}) => ({
  membership_id: email,
  user: { id: `id-${email}`, email, full_name: nombre, is_active: true },
  status: "active",
  roles: ["administrador"],
  ...extra,
});

afterEach(() => vi.unstubAllGlobals());

describe("catalogosService.personasFirma", () => {
  it("excluye revocados, inactivos y usuarios del cliente; ordena por nombre", async () => {
    const respuesta = {
      total: 6,
      miembros: [
        miembro("Zoe Ruiz", "zoe@firma.co"),
        miembro(null, "invitada@firma.co", { status: "invited" }),
        miembro("Ana Pérez", "ana@firma.co"),
        miembro("Revocado", "rev@firma.co", { status: "revoked" }),
        miembro("Inactivo", "ina@firma.co", { user: { id: "x", email: "ina@firma.co", full_name: "Inactivo", is_active: false } }),
        miembro("Cliente", "cli@empresa.co", { roles: ["cliente"] }),
      ],
    };
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json(respuesta));
    vi.stubGlobal("fetch", fetch);

    const personas = await catalogosService.personasFirma();

    expect(personas.map((p) => p.nombre)).toEqual(["Ana Pérez", "invitada@firma.co", "Zoe Ruiz"]);
    expect(String(fetch.mock.calls[0][0])).toBe("http://identidad.test/organizacion/miembros?limite=200");
  });
});
