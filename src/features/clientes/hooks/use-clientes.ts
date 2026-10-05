import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { clientesService, type ListarClientesParams } from "../api/clientes.service";

export const clientesKeys = {
  all: ["clientes"] as const,
  list: (params: ListarClientesParams) => [...clientesKeys.all, "list", params] as const,
};

export function useClientes(params: ListarClientesParams) {
  return useQuery({
    queryKey: clientesKeys.list(params),
    queryFn: ({ signal }) => clientesService.list(params, signal),
    placeholderData: keepPreviousData,
  });
}
