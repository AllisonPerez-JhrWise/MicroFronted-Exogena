import type { RutValidado, ValidarRutParams } from "../schemas/rut.schema";

// TEMPORAL: respuesta de ejemplo (datos del mockup) mientras la API del RUT no existe.
// Solo se usa con NEXT_PUBLIC_RUT_VALIDACION=false. Borrar cuando la API esté disponible.
export async function validarRutSimulado({ nit }: ValidarRutParams): Promise<RutValidado> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    nitCoincide: true,
    nit,
    digitoVerificacion: "4",
    razonSocial: "Comercializadora Andina SAS",
    tipoPersona: "JURIDICA",
    direccion: "Calle 100 # 15-20, oficina 402",
    ciudad: "Bogotá D. C.",
    departamento: "Cundinamarca",
    correo: "contabilidad@andina.com.co",
    actividadPrincipal: { codigo: "4719", descripcion: "Comercio al por menor" },
    responsabilidades: [
      { codigo: "05", descripcion: "Renta" },
      { codigo: "48", descripcion: "IVA" },
      { codigo: "42", descripcion: "Contabilidad" },
    ],
    estado: "ACTIVO",
    actualizado: "2026-09-12",
  };
}
