const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Vacío en tabla o ficha: guion largo, nunca celda en blanco ni «N/A». */
export const VACIO = "—";

/** NIT con puntos de miles y dígito de verificación: «900.123.456-4». */
export function formatNit(nit: string, digitoVerificacion?: string | null): string {
  const conPuntos = nit.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return digitoVerificacion ? `${conPuntos}-${digitoVerificacion}` : conPuntos;
}

/** Tamaño de archivo legible: «820 KB», «1,4 MB». */
export function formatTamano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toLocaleString("es-CO", { maximumFractionDigits: 1 })} MB`;
}

/**
 * Única función de fechas de la interfaz: «17 may 2027», en minúsculas y sin punto.
 * El día siempre lleva dos dígitos («05 sep 2026») para que la columna tenga ancho fijo.
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
  return `${String(fecha.getDate()).padStart(2, "0")} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}
