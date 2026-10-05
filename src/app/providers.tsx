"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { env } from "@/config/env";
import { setHeadersProvider } from "@/lib/http/api-client";
import { makeQueryClient } from "@/lib/query/query-client";

// Sesión de desarrollo local: se configura al cargar el módulo, antes de la primera petición.
// Se reemplaza por el token y la organización que entregue el host.
setHeadersProvider(() => {
  const cabeceras: Record<string, string> = {};
  if (env.devToken) cabeceras.Authorization = `Bearer ${env.devToken}`;
  if (env.organizationId) cabeceras["X-Organization-Id"] = env.organizationId;
  return cabeceras;
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
