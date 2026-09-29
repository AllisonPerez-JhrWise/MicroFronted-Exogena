import { useQuery } from "@tanstack/react-query";
import { clientesService } from "../api/clientes.service";
import { clientesKeys } from "./use-clientes";

export function useFichaEmpresa(id: string) {
  return useQuery({
    queryKey: [...clientesKeys.all, "ficha", id],
    queryFn: ({ signal }) => clientesService.ficha(id, signal),
  });
}
