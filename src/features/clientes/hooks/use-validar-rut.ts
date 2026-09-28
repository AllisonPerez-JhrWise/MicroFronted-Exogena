import { useMutation } from "@tanstack/react-query";
import { clientesService } from "../api/clientes.service";

export function useValidarRut() {
  return useMutation({ mutationFn: clientesService.validarRut });
}
