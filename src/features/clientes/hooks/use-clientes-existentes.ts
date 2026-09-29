import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { clientesService } from "../api/clientes.service";
import { NIT_DIGITOS } from "../schemas/rut.schema";

const MIN_CARACTERES_BUSQUEDA = 2;
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

/** Busca clientes existentes (grupos) mientras se escribe; desde 2 caracteres. */
export function useBuscarClientes(texto: string) {
  const q = useValorEstable(texto.trim(), ESPERA_ESCRITURA_MS);
  const activa = q.length >= MIN_CARACTERES_BUSQUEDA;
  const consulta = useQuery({
    queryKey: ["clientes", "buscar", q],
    queryFn: ({ signal }) => clientesService.buscar(q, signal),
    enabled: activa,
    placeholderData: keepPreviousData,
  });
  return { ...consulta, activa, minCaracteres: MIN_CARACTERES_BUSQUEDA };
}

/**
 * ¿El NIT ya está registrado? Se consulta con el NIT completo.
 * Lista para el paso 1; su interfaz espera el mockup.
 */
export function useNitCheck(nit: string) {
  return useQuery({
    queryKey: ["clientes", "nit-check", nit],
    queryFn: ({ signal }) => clientesService.nitCheck(nit, signal),
    enabled: nit.length === NIT_DIGITOS,
  });
}
