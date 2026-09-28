// API pública del feature: el resto de la app solo importa desde aquí.
export { ClientesVista } from "./components/clientes-vista";
export { BotonNuevoCliente } from "./components/boton-nuevo-cliente";
export { useClientes, clientesKeys } from "./hooks/use-clientes";
export type { Cliente, ClientesFiltros, EstadoCliente } from "./schemas/cliente.schema";
