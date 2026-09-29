// Nombres cortos de las responsabilidades tributarias del RUT (casilla 53, DIAN).
// La ficha solo recibe los códigos; si llega uno que no está aquí, se muestra solo el código.
// Reemplazar por el nombre que envíe el microservicio cuando lo incluya.
const RESPONSABILIDADES: Record<string, string> = {
  "05": "Renta",
  "07": "Retención en la fuente",
  "09": "Retención en la fuente en IVA",
  "13": "Gran contribuyente",
  "14": "Informante de exógena",
  "15": "Autorretenedor",
  "42": "Obligado a llevar contabilidad",
  "47": "Régimen simple de tributación",
  "48": "IVA",
  "49": "No responsable de IVA",
  "52": "Facturador electrónico",
};

/** «05 · Renta», o solo «05» si el código no está en el catálogo. */
export function nombreResponsabilidad(codigo: string) {
  const clave = codigo.padStart(2, "0");
  return RESPONSABILIDADES[clave] ? `${clave} · ${RESPONSABILIDADES[clave]}` : clave;
}
