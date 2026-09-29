import { calcularDv, type RutValidado, type ValidarRutParams } from "../schemas/rut.schema";

/** Fecha local de hace `dias` días, como YYYY-MM-DD. */
function haceDias(dias: number) {
  const f = new Date();
  f.setDate(f.getDate() - dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

// TEMPORAL: respuesta de ejemplo (datos del mockup) mientras la API del RUT no existe.
// Solo se usa con NEXT_PUBLIC_RUT_VALIDACION=false. Borrar cuando la API esté disponible.
// El DV se calcula y el RUT se genera "hace 3 días" para que back_exogena acepte la creación.
export async function validarRutSimulado({ nit }: ValidarRutParams): Promise<RutValidado> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    nit_matches: true,
    nit,
    dv: calcularDv(nit),
    person_type: "juridica",
    taxpayer_type: "Persona jurídica",
    legal_name: "Comercializadora Andina SAS",
    address: "Calle 100 # 15-20, oficina 402",
    department_code: "11",
    department_name: "Cundinamarca",
    city_code: "11001",
    city_name: "Bogotá D. C.",
    rut_email: "contabilidad@andina.com.co",
    rut_phone: null,
    main_activity_code: "4719",
    main_activity_description: "Comercio al por menor",
    tax_responsibilities: [
      { code: "05", description: "Renta" },
      { code: "48", description: "IVA" },
      { code: "42", description: "Contabilidad" },
    ],
    rut_status: "activo",
    generated_at: haceDias(3),
    rut_updated_at: "2026-09-12",
  };
}
