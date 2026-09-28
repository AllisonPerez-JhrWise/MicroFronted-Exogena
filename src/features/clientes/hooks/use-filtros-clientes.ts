"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ESTADOS_CLIENTE, type ClientesFiltros, type EstadoCliente } from "../schemas/cliente.schema";

// Los filtros viven en la URL: se pueden compartir, sobreviven a recargar y
// el botón «atrás» del navegador los respeta.
const PARAM = {
  empresa: "empresa",
  nit: "nit",
  grupo: "grupo",
  compromisosMin: "compMin",
  compromisosMax: "compMax",
  estados: "estado",
  page: "page",
} as const;

function leerEntero(valor: string | null) {
  if (valor === null || valor.trim() === "") return undefined;
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

function leerEstados(valor: string | null): EstadoCliente[] | undefined {
  const estados = (valor ?? "")
    .split(",")
    .filter((e): e is EstadoCliente => (ESTADOS_CLIENTE as readonly string[]).includes(e));
  return estados.length ? estados : undefined;
}

export function useFiltrosClientes() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filtros = useMemo<ClientesFiltros>(
    () => ({
      empresa: searchParams.get(PARAM.empresa) || undefined,
      nit: searchParams.get(PARAM.nit) || undefined,
      grupo: searchParams.get(PARAM.grupo) || undefined,
      compromisosMin: leerEntero(searchParams.get(PARAM.compromisosMin)),
      compromisosMax: leerEntero(searchParams.get(PARAM.compromisosMax)),
      estados: leerEstados(searchParams.get(PARAM.estados)),
    }),
    [searchParams],
  );
  const page = leerEntero(searchParams.get(PARAM.page)) || 1;

  const navegar = useCallback(
    (siguiente: ClientesFiltros, siguientePagina: number) => {
      const params = new URLSearchParams();
      const set = (clave: string, valor: string | number | undefined) => {
        if (valor !== undefined && valor !== "") params.set(clave, String(valor));
      };
      set(PARAM.empresa, siguiente.empresa?.trim());
      set(PARAM.nit, siguiente.nit?.trim());
      set(PARAM.grupo, siguiente.grupo?.trim());
      set(PARAM.compromisosMin, siguiente.compromisosMin);
      set(PARAM.compromisosMax, siguiente.compromisosMax);
      set(PARAM.estados, siguiente.estados?.join(","));
      if (siguientePagina > 1) set(PARAM.page, siguientePagina);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return {
    filtros,
    page,
    /** Cambiar un filtro siempre vuelve a la primera página. */
    actualizar: (cambios: Partial<ClientesFiltros>) => navegar({ ...filtros, ...cambios }, 1),
    limpiar: () => navegar({}, 1),
    irAPagina: (n: number) => navegar(filtros, n),
  };
}
