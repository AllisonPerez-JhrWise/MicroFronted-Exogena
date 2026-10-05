"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface DesplegableProps {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  /** Control que abre el panel; recibe los atributos ARIA que debe aplicar. */
  disparador: (props: { "aria-expanded": boolean; "aria-controls": string; onClick: () => void }) => ReactNode;
  alinear?: "inicio" | "fin";
  ancho?: string;
  etiqueta: string;
  children: ReactNode;
}

/**
 * Panel flotante anclado a un control. Se cierra con Escape (devolviendo el foco
 * al disparador) o con un clic fuera.
 */
export function Desplegable({
  abierto,
  onCambio,
  disparador,
  alinear = "inicio",
  ancho = "w-[260px]",
  etiqueta,
  children,
}: DesplegableProps) {
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alClicFuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) onCambio(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onCambio(false);
      raiz.current?.querySelector<HTMLElement>("[aria-controls]")?.focus();
    };
    document.addEventListener("pointerdown", alClicFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alClicFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, onCambio]);

  return (
    <div ref={raiz} className="relative">
      {disparador({ "aria-expanded": abierto, "aria-controls": id, onClick: () => onCambio(!abierto) })}
      {abierto && (
        <div
          id={id}
          role="dialog"
          aria-label={etiqueta}
          className={`absolute top-full z-10 mt-2 rounded-tarjeta border border-wi-borde-fuerte bg-wi-superficie p-3 text-cuerpo font-normal text-wi-texto ${ancho} ${alinear === "fin" ? "right-0" : "left-0"}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
