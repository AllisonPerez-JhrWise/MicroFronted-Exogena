import type { RutValidado, ValidarRutParams } from "../schemas/rut.schema";

// TEMPORAL: respuesta de ejemplo (datos del mockup) mientras la API del RUT no existe.
// Solo se usa con NEXT_PUBLIC_RUT_VALIDACION=false. Borrar cuando la API esté disponible.
export async function validarRutSimulado({ nit }: ValidarRutParams): Promise<RutValidado> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    nit_matches: true,
    nit,
    dv: "4",
    person_type: "juridica",
    legal_name: "Comercializadora Andina SAS",
    address: "Calle 100 # 15-20, oficina 402",
    department_code: "11",
    department_name: "Cundinamarca",
    city_code: "11001",
    city_name: "Bogotá D. C.",
    rut_email: "contabilidad@andina.com.co",
    main_activity_code: "4719",
    main_activity_description: "Comercio al por menor",
    tax_responsibilities: [
      { code: "05", description: "Renta" },
      { code: "48", description: "IVA" },
      { code: "42", description: "Contabilidad" },
    ],
    rut_status: "activo",
    rut_updated_at: "2026-09-12",
  };
}
