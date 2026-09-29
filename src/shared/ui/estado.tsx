export type EstadoTono = "neutro" | "accion" | "riesgo" | "ok";

const tonos: Record<EstadoTono, string> = {
  neutro: "bg-wi-neutro-fondo text-wi-neutro border-wi-neutro-linea",
  accion: "bg-wi-accion-fondo text-wi-accion border-wi-accion-linea",
  riesgo: "bg-wi-riesgo-fondo text-wi-riesgo border-wi-riesgo-linea",
  ok: "bg-wi-ok-fondo text-wi-ok border-wi-ok-linea",
};

/**
 * Regla del proyecto para las cápsulas de estado (decisión de producto, por encima de la guía Wise):
 * «activo» en verde, «inactivo» en rojo y cualquier otro estado en naranja.
 * Recibe el valor que envía la API (activo, inactivo, rut_por_renovar, por_iniciar…).
 */
export function tonoEstado(valor: string): EstadoTono {
  const v = valor.toLowerCase();
  if (v === "activo") return "ok";
  if (v === "inactivo") return "riesgo";
  return "accion";
}

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
