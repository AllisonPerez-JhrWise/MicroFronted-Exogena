export type ApiErrorKind = "http" | "network" | "timeout" | "validation";

/** Error de validación de un campo (422): `loc` es la ruta del campo, p. ej. ["body", "rut", "nit"]. */
export interface DetalleValidacion {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status?: number,
    /** `code` del sobre de error del microservicio: conflict, forbidden, validation_error… */
    readonly code?: string,
    /** `details` del sobre de error (en 422, la lista de campos inválidos). */
    readonly details?: unknown,
    /** Identificador de la petición (X-Request-ID), para soporte. */
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isClientError() {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  /** Campos inválidos de un 422, si el microservicio los envió. */
  get detallesValidacion(): DetalleValidacion[] {
    return this.code === "validation_error" && Array.isArray(this.details) ? (this.details as DetalleValidacion[]) : [];
  }
}
