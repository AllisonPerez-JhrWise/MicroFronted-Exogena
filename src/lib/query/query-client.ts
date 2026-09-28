import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http/api-error";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Reintentar un 4xx o un contrato inválido no cambia el resultado.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && (error.isClientError || error.kind === "validation")) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}
