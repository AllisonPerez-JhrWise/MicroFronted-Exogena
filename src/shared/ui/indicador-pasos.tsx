import { IconoCheck } from "./iconos";

interface IndicadorPasosProps {
  pasos: readonly string[];
  /** Índice (desde 0) del paso en curso. */
  actual: number;
}

/** Indicador de avance de un flujo. Informativo: los pasos no son navegables. */
export function IndicadorPasos({ pasos, actual }: IndicadorPasosProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-apoyo" aria-label="Pasos">
      {pasos.map((paso, i) => {
        const estado = i < actual ? "hecho" : i === actual ? "actual" : "pendiente";
        return (
          <li key={paso} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-wi-tenue">
                ·
              </span>
            )}
            <span
              aria-current={estado === "actual" ? "step" : undefined}
              className={`flex items-center gap-2 ${estado === "actual" ? "font-medium text-wi-tinta" : "text-wi-secundario"}`}
            >
              <span
                aria-hidden
                className={`flex size-5 items-center justify-center rounded-pildora font-semibold tabular-nums ${
                  estado === "actual" ? "bg-wi-tinta text-white" : "bg-wi-neutro-fondo text-wi-secundario"
                }`}
              >
                {estado === "hecho" ? <IconoCheck width={10} height={10} /> : i + 1}
              </span>
              {paso}
              {estado === "hecho" && <span className="sr-only"> (completado)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
