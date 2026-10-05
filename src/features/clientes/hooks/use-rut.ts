import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http/api-error";
import { rutService } from "../api/rut.service";

const INTERVALO_MS = 3000;
/** Tope del sondeo: 60 consultas × 3 s ≈ 3 minutos. */
const MAX_CONSULTAS = 60;

export const rutKeys = {
  lectura: (id: string) => ["rut", id] as const,
  deEmpresa: (companyId: string) => ["rut", "empresa", companyId] as const,
};

/** RUT de una empresa en extracción (ficha). Un 404 (sin RUT) no se reintenta. */
export function useRutEmpresa(companyId: string) {
  return useQuery({
    queryKey: rutKeys.deEmpresa(companyId),
    queryFn: ({ signal }) => rutService.deEmpresa(companyId, signal),
    retry: (intentos, error) => !(error instanceof ApiError && error.status === 404) && intentos < 2,
  });
}

/** Sube el RUT a extracción (POST /ruts). */
export function useCargarRut() {
  return useMutation({ mutationFn: rutService.cargar });
}

/**
 * Lectura del RUT: pregunta cada 3 s mientras esté en `pending` y se detiene en `read`,
 * `failed` o al llegar al tope. `agotado` indica que se dejó de preguntar sin respuesta final.
 */
export function useLecturaRut(id: string | null) {
  const queryClient = useQueryClient();
  const consulta = useQuery({
    queryKey: rutKeys.lectura(id ?? ""),
    queryFn: ({ signal }) => rutService.obtener(id!, signal),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" && query.state.dataUpdateCount < MAX_CONSULTAS ? INTERVALO_MS : false,
  });

  const consultas = id ? (queryClient.getQueryState(rutKeys.lectura(id))?.dataUpdateCount ?? 0) : 0;
  const agotado = consulta.data?.status === "pending" && consultas >= MAX_CONSULTAS;
  return { ...consulta, agotado };
}
