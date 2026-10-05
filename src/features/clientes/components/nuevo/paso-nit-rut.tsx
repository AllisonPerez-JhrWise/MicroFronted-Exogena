"use client";

import { useId, useRef, useState, type DragEvent, type FormEvent } from "react";
import { MensajeError } from "@/shared/components/query-state";
import { formatNit, formatTamano } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { IconoSubir } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import { useCargarRut } from "../../hooks/use-rut";
import { NIT_MAX, NIT_MIN, nitValido, nombreDelRut, RUT_MAX_BYTES, type Rut } from "../../schemas/rut.schema";

function errorDeArchivo(archivo: File): string | null {
  const esPdf = archivo.type === "application/pdf" || archivo.name.toLowerCase().endsWith(".pdf");
  if (!esPdf) return "El RUT debe estar en PDF.";
  if (archivo.size > RUT_MAX_BYTES) {
    return `El archivo pesa ${formatTamano(archivo.size)}; el máximo es ${formatTamano(RUT_MAX_BYTES)}.`;
  }
  return null;
}

/** Bloqueo cuando el NIT digitado no es el del RUT: muestra ambos para compararlos. */
function NitNoCoincide({ id, nit, rut }: { id: string; nit: string; rut: Rut }) {
  const caja = "rounded-control border border-wi-riesgo-linea bg-wi-superficie p-3";
  return (
    <div id={id}>
      <Mensaje nivel="bloqueo" titulo="El NIT digitado no coincide con el del RUT">
        <p>Corrige el NIT o carga el RUT de esta empresa. El cliente no se puede crear hasta que coincidan.</p>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div className={caja}>
            <dt className="text-wi-tinta">NIT digitado</dt>
            <dd className="text-wi-secundario tabular-nums">{formatNit(nit)}</dd>
          </div>
          <div className={caja}>
            <dt className="text-wi-tinta">NIT del RUT</dt>
            <dd className="text-wi-secundario">
              <span className="tabular-nums">{formatNit(rut.nit ?? "", rut.check_digit)}</span> · {nombreDelRut(rut)}
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
  onValidado: (resultado: ResultadoPasoNitRut) => void;
}

export function PasoNitRut({ nitInicial = "", archivoInicial = null, onCancelar, onValidado }: PasoNitRutProps) {
  const id = useId();
  const [nit, setNit] = useState(nitInicial);
  const [nitTocado, setNitTocado] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(archivoInicial);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  /** RUT leído cuyo NIT no coincide con el digitado. Se limpia al cambiar el NIT o el archivo. */
  const [noCoincide, setNoCoincide] = useState<Rut | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const validar = useCargarRut();

  const limpiarResultado = () => {
    validar.reset();
    setNoCoincide(null);
  };

  const nitCompleto = nitValido(nit);
  const errorNit =
    nitTocado && nit.length > 0 && !nitCompleto
      ? `El NIT debe tener entre ${NIT_MIN} y ${NIT_MAX} dígitos, sin el dígito de verificación.`
      : null;

  // Si algo está deshabilitado, se dice por qué.
  const faltantes = [!nitCompleto && `el NIT (${NIT_MIN} a ${NIT_MAX} dígitos)`, !archivo && "el RUT en PDF"].filter(Boolean);
  const motivoDeshabilitado = faltantes.length ? `Falta ${faltantes.join(" y ")}.` : null;

  const elegirArchivo = (elegido: File | undefined) => {
    if (!elegido) return;
    limpiarResultado();
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
    if (!nitCompleto || !archivo) return;
    validar.mutate(
      { nit, archivo },
      {
        // Si no coinciden, se queda en este paso: el cliente no se puede crear así.
        // PENDIENTE (3b): esperar la lectura (useLecturaRut) antes de decidir si coincide.
        onSuccess: (rut) => (rut.nit_matches === false ? setNoCoincide(rut) : onValidado({ nit, archivo, rut })),
      },
    );
  };

  const idNoCoincide = `${id}-no-coincide`;
  const nitInvalido = Boolean(errorNit || noCoincide);

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
          onChange={(e) => {
            limpiarResultado();
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
          RUT en PDF
        </p>
        <label
          htmlFor={`${id}-rut`}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={soltar}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-tarjeta border border-dashed px-5 py-7 text-center transition-colors duration-150 has-focus-visible:border-wi-marca-pantalla has-focus-visible:shadow-[var(--wi-foco)] ${
            arrastrando ? "border-wi-secundario bg-wi-hover" : "border-wi-borde-fuerte bg-wi-lienzo hover:bg-wi-hover"
          }`}
        >
          <IconoSubir width={18} height={18} className="text-wi-texto" />
          <span className="font-semibold text-wi-tinta">Arrastra el RUT aquí o selecciónalo</span>
          <span className="text-apoyo text-wi-secundario">PDF hasta {formatTamano(RUT_MAX_BYTES)}</span>
          <input
            ref={inputArchivo}
            id={`${id}-rut`}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
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
              PDF
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-wi-tinta">{archivo.name}</p>
              <p className="text-apoyo text-wi-secundario">
                {formatTamano(archivo.size)}
                {!noCoincide && " · listo para validar"}
              </p>
            </div>
            {noCoincide ? (
              <Button variant="texto" onClick={() => inputArchivo.current?.click()}>
                Cambiar archivo
              </Button>
            ) : (
              <Button
                variant="texto"
                aria-label={`Quitar ${archivo.name}`}
                onClick={() => {
                  limpiarResultado();
                  setArchivo(null);
                }}
              >
                Quitar
              </Button>
            )}
          </div>
        )}
      </div>

      {noCoincide && <NitNoCoincide id={idNoCoincide} nit={nit} rut={noCoincide} />}
      {validar.isError && <MensajeError error={validar.error} />}

      <div className="flex items-center justify-end gap-3">
        {motivoDeshabilitado && <p className="mr-auto text-apoyo text-wi-secundario">{motivoDeshabilitado}</p>}
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button
          type="submit"
          variant="principal"
          disabled={Boolean(motivoDeshabilitado) || Boolean(noCoincide) || validar.isPending}
        >
          {validar.isPending ? "Validando RUT…" : "Validar RUT"}
        </Button>
      </div>
    </form>
  );
}
