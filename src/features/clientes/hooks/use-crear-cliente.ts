import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesService } from "../api/clientes.service";
import { clientesKeys } from "./use-clientes";

export function useCrearCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientesService.crear,
    // El listado debe incluir el cliente nuevo.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientesKeys.all }),
  });
}
