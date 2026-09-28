export type ApiErrorKind = "http" | "network" | "timeout" | "validation";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status?: number,
    readonly body?: unknown,
    /** Identificador de la petición que entrega el microservicio, para soporte. */
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isClientError() {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }
}
