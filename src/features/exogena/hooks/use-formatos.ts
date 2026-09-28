import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { formatosService } from "../api/formatos.service";
import type { FormatosFilters } from "../schemas/formato.schema";

export const formatosKeys = {
  all: ["formatos"] as const,
  list: (filters: FormatosFilters) => [...formatosKeys.all, "list", filters] as const,
  detail: (id: string) => [...formatosKeys.all, "detail", id] as const,
};

export function useFormatos(filters: FormatosFilters) {
  return useQuery({
    queryKey: formatosKeys.list(filters),
    queryFn: ({ signal }) => formatosService.list(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useFormato(id: string) {
  return useQuery({
    queryKey: formatosKeys.detail(id),
    queryFn: ({ signal }) => formatosService.getById(id, signal),
    enabled: Boolean(id),
  });
}
