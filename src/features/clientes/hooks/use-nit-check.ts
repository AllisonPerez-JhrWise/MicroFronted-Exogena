import { useQuery } from "@tanstack/react-query";
import { clientesService } from "../api/clientes.service";
import { NIT_DIGITOS } from "../schemas/rut.schema";

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
