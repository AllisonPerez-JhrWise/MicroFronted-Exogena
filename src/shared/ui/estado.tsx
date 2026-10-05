export type EstadoTono = "neutro" | "accion" | "riesgo" | "ok" | "contorno";

const tonos: Record<EstadoTono, string> = {
  neutro: "bg-wi-neutro-fondo text-wi-neutro border-wi-neutro-linea",
  accion: "bg-wi-accion-fondo text-wi-accion border-wi-accion-linea",
  riesgo: "bg-wi-riesgo-fondo text-wi-riesgo border-wi-riesgo-linea",
  ok: "bg-wi-ok-fondo text-wi-ok border-wi-ok-linea",
  /** Trabajo en marcha: fondo blanco, borde y texto en tinta. */
  contorno: "bg-wi-superficie text-wi-tinta border-wi-tinta font-medium",
};

/**Regla del proyecto para las cápsulas de estado */
export function tonoEstado(valor: string): EstadoTono {
  switch (valor.toLowerCase()) {
    case "activo":
      return "ok";
    case "inactivo":
      return "riesgo";
    case "por_iniciar":
    case "en_curso":
      return "contorno";
    case "cerrado":
      return "neutro";
    default:
      return "accion";
  }
}

export function Estado({ tono = "neutro", children }: { tono?: EstadoTono; children: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-pildora border px-[9px] py-[2px] text-apoyo ${tonos[tono]}`}
    >
      <span aria-hidden className="size-[6px] shrink-0 rounded-pildora bg-current" />
      {children}
    </span>
  );
}
