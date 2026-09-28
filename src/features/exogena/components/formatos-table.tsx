"use client";

import { useState } from "react";
import { QueryState } from "@/shared/components/query-state";
import { useFormatos } from "../hooks/use-formatos";

const PAGE_SIZE = 20;

export function FormatosTable() {
  const [page, setPage] = useState(1);
  const { data, error, isPending, isFetching, refetch } = useFormatos({ page, pageSize: PAGE_SIZE });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <QueryState isPending={isPending} error={error} onRetry={() => refetch()}>
      <div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Código</th>
              <th className="py-2 pr-4 font-medium">Nombre</th>
              <th className="py-2 pr-4 font-medium">Versión</th>
              <th className="py-2 font-medium">Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((formato) => (
              <tr key={formato.id} className="border-b border-zinc-100">
                <td className="py-2 pr-4 font-mono">{formato.codigo}</td>
                <td className="py-2 pr-4">{formato.nombre}</td>
                <td className="py-2 pr-4">{formato.version}</td>
                <td className="py-2">{formato.vigencia}</td>
              </tr>
            ))}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500">
                  No hay formatos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </QueryState>
  );
}
