import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rutService } from "../api/rut.service";

const INTERVALO_MS = 3000;
/** Tope del sondeo: 60 consultas × 3 s ≈ 3 minutos. */
const MAX_CONSULTAS = 60;

export const rutKeys = {
  lectura: (id: string) => ["rut", id] as const,
};

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
