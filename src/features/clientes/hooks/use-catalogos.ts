import { useQuery } from "@tanstack/react-query";
import { catalogosService } from "../api/catalogos.service";
import type { RolEquipo } from "../schemas/compromiso.schema";

// Los catálogos cambian poco: se reutilizan durante la sesión sin volver a pedirlos.
const CATALOGO_STALE_MS = 10 * 60_000;

export const catalogosKeys = {
  obligaciones: ["catalogos", "obligaciones"] as const,
  tiposServicio: (obligacionId: string) => ["catalogos", "tipos-servicio", obligacionId] as const,
  miembros: (role: RolEquipo) => ["catalogos", "miembros", role] as const,
};

/** Socios o gerentes de la firma. */
export function useMiembros(role: RolEquipo) {
  return useQuery({
    queryKey: catalogosKeys.miembros(role),
    queryFn: ({ signal }) => catalogosService.miembros(role, signal),
    staleTime: CATALOGO_STALE_MS,
  });
}

export function useObligaciones() {
  return useQuery({
    queryKey: catalogosKeys.obligaciones,
    queryFn: ({ signal }) => catalogosService.obligaciones(signal),
    staleTime: CATALOGO_STALE_MS,
  });
}

export function useTiposServicio(obligacionId: string | null) {
  return useQuery({
    queryKey: catalogosKeys.tiposServicio(obligacionId ?? ""),
    queryFn: ({ signal }) => catalogosService.tiposServicio(obligacionId!, signal),
    enabled: Boolean(obligacionId),
    staleTime: CATALOGO_STALE_MS,
  });
}
