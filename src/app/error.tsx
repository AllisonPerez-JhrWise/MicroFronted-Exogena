"use client";

import { Button } from "@/shared/ui/button";
import { Mensaje } from "@/shared/ui/mensaje";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-contenido px-[28px] py-6">
      <Mensaje nivel="bloqueo" titulo="No pudimos cargar esta sección" accion={<Button onClick={reset}>Reintentar</Button>}>
        <p>Intenta de nuevo. Si el problema continúa, contacta a soporte.</p>
        {error.digest && <p className="text-apoyo">Identificador para soporte: {error.digest}</p>}
      </Mensaje>
    </main>
  );
}
