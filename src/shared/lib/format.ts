const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Vacío en tabla o ficha: guion largo, nunca celda en blanco ni «N/A». */
export const VACIO = "—";

/**
 * Única función de fechas de la interfaz: «17 may 2027», en minúsculas y sin punto.
 * Acepta Date o ISO; las fechas sin hora («2027-05-17») se leen como fecha local
 * para que la zona horaria no las corra un día.
 */
export function formatFecha(valor: Date | string | null | undefined): string {
  if (!valor) return VACIO;
  const fecha =
    typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? new Date(`${valor}T00:00:00`)
      : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return VACIO;
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}
