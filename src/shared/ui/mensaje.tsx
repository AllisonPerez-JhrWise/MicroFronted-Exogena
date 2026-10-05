import type { ReactNode } from "react";

export type MensajeNivel = "informativo" | "atencion" | "bloqueo" | "confirmacion";

// Título y texto van en el color del nivel (como en los mockups); el informativo, en neutros.
const niveles: Record<
  MensajeNivel,
  { caja: string; titulo: string; texto: string; simbolo: string; rol: "status" | "alert" }
> = {
  informativo: {
    caja: "bg-wi-superficie border-wi-borde",
    titulo: "text-wi-tinta",
    texto: "text-wi-secundario",
    simbolo: "i",
    rol: "status",
  },
  atencion: {
    caja: "bg-wi-accion-fondo border-wi-accion-linea",
    titulo: "text-wi-accion",
    texto: "text-wi-accion",
    simbolo: "!",
    rol: "status",
  },
  bloqueo: {
    caja: "bg-wi-riesgo-fondo border-wi-riesgo-linea",
    titulo: "text-wi-riesgo",
    texto: "text-wi-riesgo",
    simbolo: "!",
    rol: "alert",
  },
  confirmacion: {
    caja: "bg-wi-ok-fondo border-wi-ok-linea",
    titulo: "text-wi-ok",
    texto: "text-wi-ok",
    simbolo: "✓",
    rol: "status",
  },
};

interface MensajeProps {
  nivel: MensajeNivel;
  titulo: string;
  children?: ReactNode;
  /** Atención y bloqueo deben traer la acción que resuelve el mensaje. */
  accion?: ReactNode;
}

/** Mensaje Wise: siempre icono y texto; uno solo por pantalla (el más urgente). */
export function Mensaje({ nivel, titulo, children, accion }: MensajeProps) {
  const n = niveles[nivel];
  return (
    <div role={n.rol} className={`flex items-start gap-4 rounded-tarjeta border p-4 ${n.caja}`}>
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-pildora border border-current text-apoyo font-semibold ${n.titulo}`}
      >
        {n.simbolo}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${n.titulo}`}>{titulo}</p>
        {children && <div className={n.texto}>{children}</div>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
