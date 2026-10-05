import { describe, expect, it } from "vitest";
import { nitValido, rutListo, type Rut } from "./rut.schema";

describe("nitValido", () => {
  it("acepta de 6 a 10 dígitos, con ceros a la izquierda", () => {
    expect(nitValido("123456")).toBe(true);
    expect(nitValido("0012345678")).toBe(true);
  });

  it("rechaza longitudes fuera de rango, letras y el dígito de verificación", () => {
    expect(nitValido("12345")).toBe(false);
    expect(nitValido("12345678901")).toBe(false);
    expect(nitValido("90012345A")).toBe(false);
    expect(nitValido("900123456-8")).toBe(false);
  });
});

describe("rutListo", () => {
  const rut = (status: Rut["status"], nit_matches: boolean | null) => ({ status, nit_matches }) as Rut;

  it("solo deja continuar con la lectura terminada y el NIT coincidente", () => {
    expect(rutListo(rut("read", true))).toBe(true);
    expect(rutListo(rut("read", false))).toBe(false);
    expect(rutListo(rut("pending", null))).toBe(false);
    expect(rutListo(rut("failed", null))).toBe(false);
  });
});
