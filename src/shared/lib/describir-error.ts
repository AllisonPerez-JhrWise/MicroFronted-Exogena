import { ApiError } from "@/lib/http/api-error";

export interface ErrorDescrito {
  titulo: string;
  detalle: string;
  /** Identificador para soporte (X-Request-ID de la petición). */
  requestId?: string;
}

/**
 * Qué pasó y qué se puede hacer, en palabras del usuario. Nunca el error técnico crudo:
 * el `message` del microservicio viene en inglés y no se muestra.
 */
export function describirError(error: unknown): ErrorDescrito {
  if (!(error instanceof ApiError)) {
    return { titulo: "Ocurrió un error inesperado", detalle: "Intenta de nuevo en unos minutos." };
  }
  const { requestId } = error;
  const con = (titulo: string, detalle: string): ErrorDescrito => ({ titulo, detalle, requestId });

  switch (error.kind) {
    case "timeout":
      return con("El servicio tardó demasiado en responder", "Intenta de nuevo en unos minutos.");
    case "network":
      return con("No fue posible conectar con el servicio", "Verifica tu conexión e intenta de nuevo.");
    case "validation":
      return con(
        "El servicio respondió con información que no se pudo leer",
        "Reporta el caso a soporte con el identificador.",
      );
  }

  switch (error.code ?? String(error.status)) {
    case "unauthorized":
    case "401":
      return con("Tu sesión no es válida o expiró", "Vuelve a iniciar sesión e intenta de nuevo.");
    case "forbidden":
    case "403":
      return con("No tienes permiso para realizar esta acción", "Solicita el acceso a tu administrador.");
    case "bad_request":
      return con("No se identificó la organización en la que trabajas", "Recarga la página e intenta de nuevo.");
    case "not_found":
    case "404":
      return con("No se encontró la información solicitada", "Puede que haya sido eliminada o esté inactiva.");
    case "conflict":
    case "409":
      return con("Ya existe un registro con estos datos", "Revisa la información e intenta de nuevo.");
    case "validation_error":
    case "422":
      return con("Hay datos que el servicio no aceptó", "Revisa los campos marcados e intenta de nuevo.");
    default:
      return con("El servicio no pudo completar la solicitud", "Intenta de nuevo en unos minutos.");
  }
}
