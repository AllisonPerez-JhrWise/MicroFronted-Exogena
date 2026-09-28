// API pública del feature: el resto de la app solo importa desde aquí.
export { FormatosTable } from "./components/formatos-table";
export { useFormatos, useFormato, formatosKeys } from "./hooks/use-formatos";
export type { Formato, FormatosFilters } from "./schemas/formato.schema";
