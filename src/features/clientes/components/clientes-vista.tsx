"use client";

import Link from "next/link";
import { QueryState, SkeletonFilas } from "@/shared/components/query-state";
import { Button, buttonClasses } from "@/shared/ui/button";
import { useClientes } from "../hooks/use-clientes";
import { useColumnasVisibles } from "../hooks/use-columnas-visibles";
import { useFiltrosClientes } from "../hooks/use-filtros-clientes";
import { COLUMNAS_CLIENTE, DEFINICION_COLUMNAS } from "./columnas";
import { FiltrosClientes } from "./filtros-clientes";
import { SelectorColumnas } from "./selector-columnas";

const PAGE_SIZE = 50;

/** Listado de clientes: filtros y columnas arriba, tabla debajo. */
export function ClientesVista() {
  const { filtros, page, actualizar, limpiar, irAPagina } = useFiltrosClientes();
  const { esVisible, alternar } = useColumnasVisibles(COLUMNAS_CLIENTE);
  const { data, error, isPending, isFetching, refetch } = useClientes({ ...filtros, page, size: PAGE_SIZE });

  const columnas = COLUMNAS_CLIENTE.filter(esVisible);
  const hayFiltros = Object.values(filtros).some((v) => v !== undefined);
  const totalPaginas = data ? Math.max(1, data.pages) : 1;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <FiltrosClientes filtros={filtros} onActualizar={actualizar} onLimpiar={limpiar} />
        <SelectorColumnas esVisible={esVisible} onAlternar={alternar} />
      </div>

      <section aria-label="Clientes" className="overflow-x-auto rounded-tarjeta border border-wi-borde bg-wi-superficie">
        <QueryState
          isPending={isPending}
          error={error}
          onRetry={() => refetch()}
          skeleton={
            <div className="p-5">
              <SkeletonFilas />
            </div>
          }
        >
          {data?.items.length === 0 ? (
            <div className="flex items-center justify-between gap-5 p-5">
              {hayFiltros ? (
                <>
                  <p className="text-wi-secundario">Ningún cliente coincide con los filtros aplicados.</p>
                  <Button onClick={limpiar}>Quitar filtros</Button>
                </>
              ) : (
                <p className="text-wi-secundario">Aún no hay clientes registrados. Crea el primero con «Nuevo cliente».</p>
              )}
            </div>
          ) : (
            <table className="wi-tabla" aria-busy={isFetching}>
              <thead>
                <tr>
                  {columnas.map((columna) => (
                    <th key={columna} scope="col" className={DEFINICION_COLUMNAS[columna].numerica ? "num" : undefined}>
                      {DEFINICION_COLUMNAS[columna].titulo}
                    </th>
                  ))}
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((cliente) => (
                  <tr key={cliente.id}>
                    {columnas.map((columna) => (
                      <td key={columna} className={DEFINICION_COLUMNAS[columna].numerica ? "num" : undefined}>
                        {DEFINICION_COLUMNAS[columna].celda(cliente)}
                      </td>
                    ))}
                    <td className="text-right">
                      <Link
                        href={`/clientes/${encodeURIComponent(cliente.id)}`}
                        aria-label={`Ver ${cliente.display_name}`}
                        className={buttonClasses("texto")}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </QueryState>
      </section>

      {totalPaginas > 1 && (
        <nav aria-label="Paginación" className="mt-4 flex items-center justify-end gap-4 text-apoyo text-wi-secundario">
          <Button disabled={page <= 1} onClick={() => irAPagina(page - 1)}>
            Anterior
          </Button>
          <span className="tabular-nums">
            Página {page} de {totalPaginas}
          </span>
          <Button disabled={page >= totalPaginas} onClick={() => irAPagina(page + 1)}>
            Siguiente
          </Button>
        </nav>
      )}
    </>
  );
}
