import type { ReactNode } from "react";
import { ApiError } from "@/lib/http/api-error";

function describeError(error: unknown) {
  if (!(error instanceof ApiError)) return "Ocurrió un error inesperado.";
  switch (error.kind) {
    case "timeout":
      return "El servicio tardó demasiado en responder. Intenta de nuevo.";
    case "network":
      return "No fue posible conectar con el servicio. Verifica tu conexión.";
    case "validation":
      return "El servicio respondió con un formato inesperado.";
    default:
      return error.status === 404 ? "No se encontró la información solicitada." : error.message;
  }
}

interface QueryStateProps {
  isPending: boolean;
  error: unknown;
  onRetry?: () => void;
  children: ReactNode;
}

/** Resuelve de forma uniforme los estados de carga y error de una consulta. */
export function QueryState({ isPending, error, onRetry, children }: QueryStateProps) {
  if (isPending) {
    return <p className="py-8 text-center text-sm text-zinc-500">Cargando…</p>;
  }
  if (error) {
    return (
      <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{describeError(error)}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-2 font-medium underline">
            Reintentar
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
