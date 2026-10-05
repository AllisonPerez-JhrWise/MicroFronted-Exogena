import type { ReactNode } from "react";
import { formatFecha, formatNit, VACIO } from "@/shared/lib/format";
import { Estado, tonoEstado, type EstadoTono } from "@/shared/ui/estado";
import { digitoDe, type Cliente, type EstadoCliente } from "../schemas/cliente.schema";

// Color según la regla de cápsulas del proyecto (ver tonoEstado).
export const ESTADO_CLIENTE: Record<EstadoCliente, { etiqueta: string; tono: EstadoTono }> = {
  active: { etiqueta: "Activo", tono: tonoEstado("active") },
  inactive: { etiqueta: "Inactivo", tono: tonoEstado("inactive") },
  rut_renewal_due: { etiqueta: "RUT por renovar", tono: tonoEstado("rut_renewal_due") },
};

/** Meses completos entre una fecha (YYYY-MM-DD) y hoy. */
function mesesDesde(fecha: string) {
  const [a, m, d] = fecha.split("-").map(Number);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - a) * 12 + (hoy.getMonth() + 1 - m);
  if (hoy.getDate() < d) meses -= 1;
  return Math.max(0, meses);
}

/**
 * Línea de apoyo bajo la fecha del RUT, que arma el front según la API:
 * «RUT cargado antes» si la fecha es desconocida; «Generado hace N meses» si está por renovar.
 */
function notaRut(c: Cliente): string | null {
  if (c.rut_date_unknown) return "RUT cargado antes";
  if (c.status === "rut_renewal_due" && c.rut_generated_at) {
    const meses = mesesDesde(c.rut_generated_at);
    return `Generado hace ${meses} ${meses === 1 ? "mes" : "meses"}`;
  }
  return null;
}

export const COLUMNAS_CLIENTE = ["empresa", "nit", "grupo", "compromisos", "rut", "estado"] as const;
export type ColumnaCliente = (typeof COLUMNAS_CLIENTE)[number];

interface DefinicionColumna {
  titulo: string;
  /** Cifras y fechas a la derecha, con números tabulares. */
  numerica?: boolean;
  /** No se puede ocultar: sin ella la fila no se identifica. */
  obligatoria?: boolean;
  celda: (cliente: Cliente) => ReactNode;
}

export const DEFINICION_COLUMNAS: Record<ColumnaCliente, DefinicionColumna> = {
  empresa: { titulo: "Empresa", obligatoria: true, celda: (c) => c.display_name },
  // El NIT es un identificador, no una cantidad: va a la izquierda como el mockup.
  nit: { titulo: "NIT", celda: (c) => <span className="whitespace-nowrap tabular-nums">{formatNit(c.nit, digitoDe(c))}</span> },
  grupo: { titulo: "Grupo", celda: (c) => c.group ?? VACIO },
  compromisos: { titulo: "Compromisos activos", numerica: true, celda: (c) => c.active_engagements },
  rut: {
    titulo: "RUT actualizado",
    numerica: true,
    celda: (c) => {
      const nota = notaRut(c);
      return (
        <>
          {c.rut_date_unknown || !c.rut_updated_at ? "Sin identificar" : formatFecha(c.rut_updated_at)}
          {nota && <span className="block text-apoyo text-wi-secundario">{nota}</span>}
        </>
      );
    },
  },
  estado: {
    titulo: "Estado",
    celda: (c) => <Estado tono={ESTADO_CLIENTE[c.status].tono}>{ESTADO_CLIENTE[c.status].etiqueta}</Estado>,
  },
};
