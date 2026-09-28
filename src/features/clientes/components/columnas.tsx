import type { ReactNode } from "react";
import { formatFecha, VACIO } from "@/shared/lib/format";
import { Estado, type EstadoTono } from "@/shared/ui/estado";
import type { Cliente, EstadoCliente } from "../schemas/cliente.schema";

// Solo tiene color lo que pide algo: «RUT por renovar» pide acción; «Activo» e «Inactivo» no.
export const ESTADO_CLIENTE: Record<EstadoCliente, { etiqueta: string; tono: EstadoTono }> = {
  ACTIVO: { etiqueta: "Activo", tono: "neutro" },
  INACTIVO: { etiqueta: "Inactivo", tono: "neutro" },
  RUT_POR_RENOVAR: { etiqueta: "RUT por renovar", tono: "accion" },
};

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
  empresa: { titulo: "Empresa", obligatoria: true, celda: (c) => c.empresa },
  // El NIT es un identificador, no una cantidad: va a la izquierda como el mockup.
  nit: { titulo: "NIT", celda: (c) => <span className="tabular-nums">{c.nit}</span> },
  grupo: { titulo: "Grupo", celda: (c) => c.grupo ?? VACIO },
  compromisos: { titulo: "Compromisos activos", numerica: true, celda: (c) => c.compromisosActivos },
  rut: {
    titulo: "RUT actualizado",
    numerica: true,
    celda: (c) => (
      <>
        {c.rutActualizado ? formatFecha(c.rutActualizado) : "Sin identificar"}
        {c.rutNota && <span className="block text-apoyo text-wi-secundario">{c.rutNota}</span>}
      </>
    ),
  },
  estado: {
    titulo: "Estado",
    celda: (c) => <Estado tono={ESTADO_CLIENTE[c.estado].tono}>{ESTADO_CLIENTE[c.estado].etiqueta}</Estado>,
  },
};
