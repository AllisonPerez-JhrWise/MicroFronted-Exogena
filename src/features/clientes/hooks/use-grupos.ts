import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { clientesService } from "../api/clientes.service";

const ESPERA_ESCRITURA_MS = 300;

/** Devuelve el valor cuando el usuario deja de escribir por un momento. */
function useValorEstable<T>(valor: T, ms: number) {
  const [estable, setEstable] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setEstable(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return estable;
}

export const gruposKeys = {
  buscar: (q: string) => ["grupos", "buscar", q] as const,
};

/**
 * Catálogo de grupos filtrado por lo que se escribe. Con el texto vacío trae
 * todos (máximo 20), así la lista se ve apenas se abre.
 */
export function useBuscarGrupos(texto: string, habilitado = true) {
  const q = useValorEstable(texto.trim(), ESPERA_ESCRITURA_MS);
  return useQuery({
    queryKey: gruposKeys.buscar(q),
    queryFn: ({ signal }) => clientesService.grupos(q, signal),
    enabled: habilitado,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
