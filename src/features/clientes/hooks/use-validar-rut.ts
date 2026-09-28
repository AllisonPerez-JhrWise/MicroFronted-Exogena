import { useMutation } from "@tanstack/react-query";
import { rutService } from "../api/rut.service";

export function useValidarRut() {
  return useMutation({ mutationFn: rutService.validar });
}
