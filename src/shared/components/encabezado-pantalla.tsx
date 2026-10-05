import type { ReactNode } from "react";

interface EncabezadoPantallaProps {
  /**
   * Nombre de la sección seleccionada en el nav. Mientras no sepamos cómo lo expone
   * el shell, cada página lo pasa fijo; luego solo cambia de dónde se obtiene.
   */
  titulo: string;
  /** Acciones a la derecha del título (la principal de la pantalla va aquí). */
  acciones?: ReactNode;
}

/** Título de la pantalla. La ruta («Operación · Clientes») la pinta la barra superior del shell. */
export function EncabezadoPantalla({ titulo, acciones }: EncabezadoPantallaProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-5">
      <h1 className="text-pantalla font-semibold tracking-[-0.01em] text-wi-tinta">{titulo}</h1>
      {acciones && <div className="flex items-center gap-3">{acciones}</div>}
    </header>
  );
}
