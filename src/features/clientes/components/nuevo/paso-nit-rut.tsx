"use client";

import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from "react";
import { ApiError } from "@/lib/http/api-error";
import { MensajeError } from "@/shared/components/query-state";
import { formatNit, formatTamano } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { IconoSubir } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import { useCargarRut, useLecturaRut } from "../../hooks/use-rut";
import {
  NIT_MAX,
  NIT_MIN,
  nitValido,
  nombreDelRut,
  RUT_EXTENSIONES,
  RUT_MAX_BYTES,
  RUT_TIPOS,
  rutListo,
  type Rut,
} from "../../schemas/rut.schema";

const ACCEPT = [...RUT_TIPOS, ...RUT_EXTENSIONES].join(",");

const extension = (archivo: File) => archivo.name.slice(archivo.name.lastIndexOf(".")).toLowerCase();

function errorDeArchivo(archivo: File): string | null {
  const admitido =
    (RUT_TIPOS as readonly string[]).includes(archivo.type) ||
    (RUT_EXTENSIONES as readonly string[]).includes(extension(archivo));
  if (!admitido) return "El RUT debe estar en PDF, JPG, PNG o WEBP.";
  if (archivo.size === 0) return "El archivo está vacío.";
  if (archivo.size > RUT_MAX_BYTES) {
    return `El archivo pesa ${formatTamano(archivo.size)}; el máximo es ${formatTamano(RUT_MAX_BYTES)}.`;
  }
  return null;
}

/** Etiqueta del ícono del archivo: PDF, JPG, PNG o WEBP. */
function tipoArchivo(archivo: File) {
  const ext = extension(archivo).replace(".", "").toUpperCase();
  return ext === "JPEG" ? "JPG" : ext || "DOC";
}

/** Error al subir (extracción responde { detail } en español): qué pasó y qué hacer. */
function ErrorCarga({ error }: { error: unknown }) {
  if (!(error instanceof ApiError) || error.kind !== "http" || error.code) return <MensajeError error={error} />;
  const texto = typeof error.details === "string" ? error.details : null;
  switch (error.status) {
    case 400:
      return <Mensaje nivel="bloqueo" titulo="El archivo está vacío"><p>Carga el RUT de nuevo.</p></Mensaje>;
    case 413:
      return (
        <Mensaje nivel="bloqueo" titulo="El archivo es muy grande">
          <p>El máximo es {formatTamano(RUT_MAX_BYTES)}. {texto}</p>
        </Mensaje>
      );
    case 415:
      return (
        <Mensaje nivel="bloqueo" titulo="Formato no admitido">
          <p>Carga el RUT en PDF, JPG, PNG o WEBP.</p>
        </Mensaje>
      );
    case 422:
      return (
        <Mensaje nivel="bloqueo" titulo="El NIT no es válido">
          <p>
            Escribe solo dígitos, de {NIT_MIN} a {NIT_MAX}, sin el dígito de verificación.
          </p>
        </Mensaje>
      );
    default:
      return <MensajeError error={error} />;
  }
}

/** Bloqueo cuando el NIT digitado no es el del RUT: muestra ambos para compararlos. */
function NitNoCoincide({ id, nit, rut }: { id: string; nit: string; rut: Rut }) {
  const caja = "rounded-control border border-wi-riesgo-linea bg-wi-superficie p-3";
  return (
    <div id={id}>
      <Mensaje nivel="bloqueo" titulo="El NIT digitado no coincide con el del RUT">
        <p>
          {rut.nit_warning ??
            "Corrige el NIT o carga el RUT de esta empresa. El cliente no se puede crear hasta que coincidan."}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div className={caja}>
            <dt className="text-wi-tinta">NIT digitado</dt>
            <dd className="text-wi-secundario tabular-nums">{formatNit(nit)}</dd>
          </div>
          <div className={caja}>
            <dt className="text-wi-tinta">NIT del RUT</dt>
            <dd className="text-wi-secundario">
              <span className="tabular-nums">{rut.nit ? formatNit(rut.nit, rut.check_digit) : "Sin identificar"}</span>
              {nombreDelRut(rut) && ` · ${nombreDelRut(rut)}`}
            </dd>
          </div>
        </dl>
      </Mensaje>
    </div>
  );
}

export interface ResultadoPasoNitRut {
  nit: string;
  archivo: File;
  rut: Rut;
}

interface PasoNitRutProps {
  /** Valores con los que se vuelve a este paso desde «Atrás». */
  nitInicial?: string;
  archivoInicial?: File | null;
  onCancelar: () => void;
  /** Solo se llama con la lectura en `read` y el NIT coincidente. */
  onValidado: (resultado: ResultadoPasoNitRut) => void;
}

export function PasoNitRut({ nitInicial = "", archivoInicial = null, onCancelar, onValidado }: PasoNitRutProps) {
  const id = useId();
  const [nit, setNit] = useState(nitInicial);
  const [nitTocado, setNitTocado] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(archivoInicial);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  /** Lectura en curso en extracción. Se descarta al cambiar el NIT o el archivo. */
  const [rutId, setRutId] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const cargar = useCargarRut();
  const lectura = useLecturaRut(rutId);

  const rut = lectura.data;
  const leyendo = cargar.isPending || (Boolean(rutId) && (lectura.isPending || rut?.status === "pending") && !lectura.agotado);
  const fallida = rut?.status === "failed";
  const noCoincide = rut?.status === "read" && rut.nit_matches === false ? rut : null;

  // Lectura lista y con el NIT coincidente: se pasa a «Datos del RUT».
  const lista = rut && rutListo(rut) ? rut : null;
  useEffect(() => {
    if (lista && archivo) onValidado({ nit, archivo, rut: lista });
    // Solo al quedar lista la lectura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista?.id]);

  const descartarLectura = () => {
    cargar.reset();
    setRutId(null);
  };

  const nitCompleto = nitValido(nit);
  const errorNit =
    nitTocado && nit.length > 0 && !nitCompleto
      ? `El NIT debe tener entre ${NIT_MIN} y ${NIT_MAX} dígitos, sin el dígito de verificación.`
      : null;

  // Si algo está deshabilitado, se dice por qué.
  const faltantes = [!nitCompleto && `el NIT (${NIT_MIN} a ${NIT_MAX} dígitos)`, !archivo && "el RUT"].filter(Boolean);
  const motivoDeshabilitado = faltantes.length
    ? `Falta ${faltantes.join(" y ")}.`
    : noCoincide
      ? "Corrige el NIT o cambia el archivo."
      : fallida
        ? "Carga otro archivo para intentar de nuevo."
        : null;

  const elegirArchivo = (elegido: File | undefined) => {
    if (!elegido) return;
    descartarLectura();
    const error = errorDeArchivo(elegido);
    setErrorArchivo(error);
    setArchivo(error ? null : elegido);
  };

  const soltar = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setArrastrando(false);
    elegirArchivo(e.dataTransfer.files[0]);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!nitCompleto || !archivo || leyendo) return;
    // El NIT viaja como texto: conserva los ceros a la izquierda.
    cargar.mutate({ nit, archivo }, { onSuccess: (nuevo) => setRutId(nuevo.id) });
  };

  const idNoCoincide = `${id}-no-coincide`;
  const nitInvalido = Boolean(errorNit || noCoincide);
  const cambiarArchivo = () => inputArchivo.current?.click();

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor={`${id}-nit`} className="mb-1 block font-medium text-wi-tinta">
          NIT, sin dígito de verificación
        </label>
        <Campo
          id={`${id}-nit`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={NIT_MAX}
          value={nit}
          disabled={leyendo}
          onChange={(e) => {
            descartarLectura();
            setNit(e.target.value.replace(/\D/g, ""));
          }}
          onBlur={() => setNitTocado(true)}
          aria-invalid={nitInvalido}
          aria-describedby={errorNit ? `${id}-nit-error` : noCoincide ? idNoCoincide : undefined}
          className={nitInvalido ? "border-wi-riesgo" : ""}
          autoFocus
        />
        {errorNit && (
          <p id={`${id}-nit-error`} className="mt-1 text-apoyo text-wi-riesgo">
            {errorNit}
          </p>
        )}
      </div>

      <div>
        <p id={`${id}-rut-etiqueta`} className="mb-1 font-medium text-wi-tinta">
          RUT
        </p>
        <label
          htmlFor={`${id}-rut`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!leyendo) setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => (leyendo ? e.preventDefault() : soltar(e))}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-tarjeta border border-dashed px-5 py-7 text-center transition-colors duration-150 has-focus-visible:border-wi-marca-pantalla has-focus-visible:shadow-[var(--wi-foco)] has-disabled:cursor-default has-disabled:opacity-45 ${
            arrastrando ? "border-wi-secundario bg-wi-hover" : "border-wi-borde-fuerte bg-wi-lienzo hover:bg-wi-hover"
          }`}
        >
          <IconoSubir width={18} height={18} className="text-wi-texto" />
          <span className="font-semibold text-wi-tinta">Arrastra el RUT aquí o selecciónalo</span>
          <span className="text-apoyo text-wi-secundario">
            PDF, JPG, PNG o WEBP hasta {formatTamano(RUT_MAX_BYTES)}
          </span>
          <input
            ref={inputArchivo}
            id={`${id}-rut`}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={leyendo}
            aria-labelledby={`${id}-rut-etiqueta`}
            aria-describedby={errorArchivo ? `${id}-rut-error` : undefined}
            onChange={(e) => {
              elegirArchivo(e.target.files?.[0]);
              e.target.value = ""; // permite volver a elegir el mismo archivo
            }}
          />
        </label>
        {errorArchivo && (
          <p id={`${id}-rut-error`} role="alert" className="mt-1 text-apoyo text-wi-riesgo">
            {errorArchivo}
          </p>
        )}

        {archivo && (
          <div className="mt-3 flex items-center gap-4 rounded-tarjeta border border-wi-borde p-4">
            {/* Rojo del mockup aprobado (excepción pedida a la regla de color de la guía). */}
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-control bg-wi-riesgo text-antetitulo font-semibold text-white"
            >
              {tipoArchivo(archivo)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-wi-tinta">{archivo.name}</p>
              <p className="text-apoyo text-wi-secundario">
                {formatTamano(archivo.size)}
                {leyendo ? " · leyendo…" : !rutId && " · listo para validar"}
              </p>
            </div>
            {noCoincide || fallida ? (
              <Button variant="texto" onClick={cambiarArchivo}>
                Cambiar archivo
              </Button>
            ) : (
              <Button
                variant="texto"
                disabled={leyendo}
                aria-label={`Quitar ${archivo.name}`}
                onClick={() => {
                  descartarLectura();
                  setArchivo(null);
                }}
              >
                Quitar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Un solo mensaje: el del estado actual de la lectura. */}
      {cargar.isError ? (
        <ErrorCarga error={cargar.error} />
      ) : lectura.isError && !rut ? (
        <MensajeError error={lectura.error} onRetry={() => lectura.refetch()} />
      ) : lectura.agotado ? (
        <Mensaje
          nivel="atencion"
          titulo="La lectura del RUT está tardando más de lo normal"
          accion={<Button onClick={descartarLectura}>Intentar de nuevo</Button>}
        >
          <p>Vuelve a cargar el archivo en unos minutos.</p>
        </Mensaje>
      ) : leyendo ? (
        <Mensaje nivel="informativo" titulo="Leyendo el RUT…">
          <p>Esto puede tardar hasta un par de minutos. No cierres esta ventana.</p>
        </Mensaje>
      ) : fallida ? (
        <Mensaje
          nivel="bloqueo"
          titulo="No se pudo leer el RUT"
          accion={<Button onClick={cambiarArchivo}>Cargar otro archivo</Button>}
        >
          <p>{rut.error_message ?? "Revisa que el documento sea el RUT y que se vea completo."}</p>
        </Mensaje>
      ) : noCoincide ? (
        <NitNoCoincide id={idNoCoincide} nit={nit} rut={noCoincide} />
      ) : null}

      <div className="flex items-center justify-end gap-3">
        {motivoDeshabilitado && <p className="mr-auto text-apoyo text-wi-secundario">{motivoDeshabilitado}</p>}
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" variant="principal" disabled={Boolean(motivoDeshabilitado) || leyendo}>
          {leyendo ? "Leyendo el RUT…" : "Validar RUT"}
        </Button>
      </div>
    </form>
  );
}
