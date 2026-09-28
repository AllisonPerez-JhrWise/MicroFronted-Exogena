"use client";

import { useState } from "react";
import { QueryState } from "@/shared/components/query-state";
import { Button } from "@/shared/ui/button";
import { useFormatos } from "../hooks/use-formatos";

const PAGE_SIZE = 20;

export function FormatosTable() {
  const [page, setPage] = useState(1);
  const { data, error, isPending, isFetching, refetch } = useFormatos({ page, pageSize: PAGE_SIZE });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="rounded-tarjeta border border-wi-borde bg-wi-superficie p-5">
      <QueryState isPending={isPending} error={error} onRetry={() => refetch()}>
        {data?.items.length === 0 ? (
          <p className="text-wi-secundario">Aún no hay formatos registrados.</p>
        ) : (
          <div aria-busy={isFetching}>
            <table className="wi-tabla">
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Nombre</th>
                  <th scope="col" className="num">Versión</th>
                  <th scope="col" className="num">Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((formato) => (
                  <tr key={formato.id}>
                    <td>{formato.codigo}</td>
                    <td>{formato.nombre}</td>
                    <td className="num">{formato.version}</td>
                    <td className="num">{formato.vigencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <nav aria-label="Paginación" className="mt-4 flex items-center justify-end gap-4 text-apoyo text-wi-secundario">
              <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="tabular-nums">
                Página {page} de {totalPages}
              </span>
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </nav>
          </div>
        )}
      </QueryState>
    </section>
  );
}
