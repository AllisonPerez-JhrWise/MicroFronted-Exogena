export type EstadoTono = "neutro" | "accion" | "riesgo" | "ok";

// Gris por defecto; ámbar cuando alguien debe actuar; rojo ante riesgo o vencimiento.
// «ok» (verde) es una excepción aprobada para el estado del RUT en «Nuevo cliente», según su mockup;
// no usarlo en tablas: «Entregado» o «Cerrado» ya no piden nada y van en gris.
const tonos: Record<EstadoTono, string> = {
  neutro: "bg-wi-neutro-fondo text-wi-neutro border-wi-neutro-linea",
  accion: "bg-wi-accion-fondo text-wi-accion border-wi-accion-linea",
  riesgo: "bg-wi-riesgo-fondo text-wi-riesgo border-wi-riesgo-linea",
  ok: "bg-wi-ok-fondo text-wi-ok border-wi-ok-linea",
};

/** Píldora de estado. Siempre lleva texto: el color nunca comunica solo. */
export function Estado({ tono = "neutro", children }: { tono?: EstadoTono; children: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-pildora border px-[9px] py-[2px] text-apoyo ${tonos[tono]}`}
    >
      {children}
    </span>
  );
}
