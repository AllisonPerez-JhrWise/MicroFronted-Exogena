import { ApiError } from "@/lib/http/api-error";

export interface ErrorDescrito {
  titulo: string;
  detalle: string;
  /** Identificador para soporte, si el microservicio lo entregó. */
  requestId?: string;
}

/** Qué pasó y qué se puede hacer, en palabras del usuario. Nunca el error técnico crudo. */
export function describirError(error: unknown): ErrorDescrito {
  if (!(error instanceof ApiError)) {
    return { titulo: "Ocurrió un error inesperado", detalle: "Intenta de nuevo en unos minutos." };
  }
  const { requestId } = error;
  switch (error.kind) {
    case "timeout":
      return { titulo: "El servicio tardó demasiado en responder", detalle: "Intenta de nuevo en unos minutos.", requestId };
    case "network":
      return {
        titulo: "No fue posible conectar con el servicio",
        detalle: "Verifica tu conexión e intenta de nuevo.",
        requestId,
      };
    case "validation":
      return {
        titulo: "El servicio respondió con información que no se pudo leer",
        detalle: "Reporta el caso a soporte con el identificador.",
        requestId,
      };
    default:
      if (error.status === 404) {
        return { titulo: "No se encontró la información solicitada", detalle: "Puede que haya sido eliminada.", requestId };
      }
      if (error.status === 401 || error.status === 403) {
        return {
          titulo: "No tienes permiso para realizar esta acción",
          detalle: "Solicita el acceso a tu administrador.",
          requestId,
        };
      }
      return { titulo: "El servicio no pudo completar la solicitud", detalle: "Intenta de nuevo en unos minutos.", requestId };
  }
}
