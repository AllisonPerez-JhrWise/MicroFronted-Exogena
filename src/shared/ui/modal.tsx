"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  /** id del título que nombra la ventana (aria-labelledby). */
  tituloId: string;
  onCerrar: () => void;
  children: ReactNode;
}

/**
 * Ventana modal sobre `<dialog>` nativo: el navegador mantiene el foco dentro,
 * deja el resto de la página inerte y cierra con Escape (que aquí delega en onCerrar).
 * No se cierra con clic fuera, para no perder lo que el usuario lleva diligenciado.
 */
export function Modal({ tituloId, onCerrar, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    // Quien abrió la ventana (p. ej. «Nuevo cliente») recupera el foco al cerrarla.
    const origen = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialogo && !dialogo.open) {
      dialogo.showModal();
      // showModal enfoca el primer botón (la ×): se lleva el foco al primer campo, si hay.
      dialogo.querySelector<HTMLElement>("input:not([type=hidden]):not(:disabled), select, textarea")?.focus();
    }
    return () => {
      dialogo?.close();
      if (origen?.isConnected) origen.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={tituloId}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      // El ancho lo define el contenido; nunca más que la pantalla menos 16 px por lado.
      className="m-auto w-fit max-w-[calc(100%-32px)] rounded-tarjeta border border-wi-borde bg-wi-superficie p-6 text-cuerpo text-wi-texto backdrop:bg-wi-tinta/40"
    >
      {children}
    </dialog>
  );
}
