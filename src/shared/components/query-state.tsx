"use client";

import { useEffect, useState, type ReactNode } from "react";
import { describirError } from "@/shared/lib/describir-error";
import { Button } from "@/shared/ui/button";
import { Mensaje } from "@/shared/ui/mensaje";

const AVISO_CARGA_LENTA_MS = 5000;

/** Mensaje de bloqueo a partir de un error: qué pasó, qué hacer e identificador de soporte. */
export function MensajeError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { titulo, detalle, requestId } = describirError(error);
  return (
    <Mensaje nivel="bloqueo" titulo={titulo} accion={onRetry && <Button onClick={onRetry}>Reintentar</Button>}>
      <p>{detalle}</p>
      {requestId && <p className="text-apoyo">Identificador para soporte: {requestId}</p>}
    </Mensaje>
  );
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
  if (error) return <MensajeError error={error} onRetry={onRetry} />;
  if (isPending) return <Cargando skeleton={skeleton} />;
  return <>{children}</>;
}
