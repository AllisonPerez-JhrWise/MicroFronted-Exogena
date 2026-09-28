"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/http/api-error";
import { Button } from "@/shared/ui/button";
import { Mensaje } from "@/shared/ui/mensaje";

const AVISO_CARGA_LENTA_MS = 5000;

// Qué pasó y qué se puede hacer. Nunca el error técnico crudo.
function describeError(error: unknown): { titulo: string; detalle: string } {
  if (!(error instanceof ApiError)) {
    return { titulo: "Ocurrió un error inesperado", detalle: "Intenta de nuevo en unos minutos." };
  }
  switch (error.kind) {
    case "timeout":
      return { titulo: "El servicio tardó demasiado en responder", detalle: "Intenta de nuevo en unos minutos." };
    case "network":
      return { titulo: "No fue posible conectar con el servicio", detalle: "Verifica tu conexión e intenta de nuevo." };
    case "validation":
      return {
        titulo: "El servicio respondió con información que no se pudo leer",
        detalle: "Reporta el caso a soporte con el identificador.",
      };
    default:
      if (error.status === 404) {
        return { titulo: "No se encontró la información solicitada", detalle: "Puede que haya sido eliminada." };
      }
      if (error.status === 401 || error.status === 403) {
        return { titulo: "No tienes permiso para ver esta información", detalle: "Solicita el acceso a tu administrador." };
      }
      return { titulo: "El servicio no pudo completar la solicitud", detalle: "Intenta de nuevo en unos minutos." };
  }
}

/** Esqueleto por defecto: filas grises con la forma de una tabla. */
export function SkeletonFilas({ filas = 6 }: { filas?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="h-4 rounded-control bg-wi-neutro-fondo" />
      ))}
    </div>
  );
}

function Cargando({ skeleton }: { skeleton: ReactNode }) {
  const [lento, setLento] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLento(true), AVISO_CARGA_LENTA_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      {skeleton}
      {lento && <p className="mt-4 text-apoyo text-wi-secundario">Esto está tardando más de lo normal…</p>}
    </div>
  );
}

interface QueryStateProps {
  isPending: boolean;
  error: unknown;
  onRetry?: () => void;
  /** Forma del contenido mientras carga. */
  skeleton?: ReactNode;
  children: ReactNode;
}

/** Resuelve de forma uniforme los estados de carga y error de una consulta. */
export function QueryState({ isPending, error, onRetry, skeleton = <SkeletonFilas />, children }: QueryStateProps) {
  if (error) {
    const { titulo, detalle } = describeError(error);
    const requestId = error instanceof ApiError ? error.requestId : undefined;
    return (
      <Mensaje
        nivel="bloqueo"
        titulo={titulo}
        accion={onRetry && <Button onClick={onRetry}>Reintentar</Button>}
      >
        <p>{detalle}</p>
        {requestId && <p className="text-apoyo">Identificador para soporte: {requestId}</p>}
      </Mensaje>
    );
  }
  if (isPending) return <Cargando skeleton={skeleton} />;
  return <>{children}</>;
}
