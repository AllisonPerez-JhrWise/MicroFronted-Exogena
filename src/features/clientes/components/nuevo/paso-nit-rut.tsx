"use client";

import { useId, useState, type DragEvent, type FormEvent } from "react";
import { MensajeError } from "@/shared/components/query-state";
import { formatTamano } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { IconoSubir } from "@/shared/ui/iconos";
import { useValidarRut } from "../../hooks/use-validar-rut";
import { NIT_DIGITOS, RUT_MAX_BYTES, type RutValidado } from "../../schemas/rut.schema";

function errorDeArchivo(archivo: File): string | null {
  const esPdf = archivo.type === "application/pdf" || archivo.name.toLowerCase().endsWith(".pdf");
  if (!esPdf) return "El RUT debe estar en PDF.";
  if (archivo.size > RUT_MAX_BYTES) {
    return `El archivo pesa ${formatTamano(archivo.size)}; el máximo es ${formatTamano(RUT_MAX_BYTES)}.`;
  }
  return null;
}

interface PasoNitRutProps {
  onCancelar: () => void;
  onValidado: (rut: RutValidado) => void;
}

export function PasoNitRut({ onCancelar, onValidado }: PasoNitRutProps) {
  const id = useId();
  const [nit, setNit] = useState("");
  const [nitTocado, setNitTocado] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const validar = useValidarRut();

  const nitCompleto = nit.length === NIT_DIGITOS;
  const errorNit =
    nitTocado && nit.length > 0 && !nitCompleto
      ? `El NIT debe tener ${NIT_DIGITOS} dígitos, sin el dígito de verificación.`
      : null;

  // Si algo está deshabilitado, se dice por qué.
  const faltantes = [!nitCompleto && `el NIT de ${NIT_DIGITOS} dígitos`, !archivo && "el RUT en PDF"].filter(Boolean);
  const motivoDeshabilitado = faltantes.length ? `Falta ${faltantes.join(" y ")}.` : null;

  const elegirArchivo = (elegido: File | undefined) => {
    if (!elegido) return;
    validar.reset();
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
    validar.mutate({ nit, archivo }, { onSuccess: onValidado });
  };

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor={`${id}-nit`} className="mb-1 block font-medium text-wi-secundario">
          NIT, sin dígito de verificación
        </label>
        <Campo
          id={`${id}-nit`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={NIT_DIGITOS}
          value={nit}
          onChange={(e) => {
            validar.reset();
            setNit(e.target.value.replace(/\D/g, ""));
          }}
          onBlur={() => setNitTocado(true)}
          aria-invalid={Boolean(errorNit)}
          aria-describedby={errorNit ? `${id}-nit-error` : undefined}
          className={errorNit ? "border-wi-riesgo" : ""}
          autoFocus
        />
        {errorNit && (
          <p id={`${id}-nit-error`} className="mt-1 text-apoyo text-wi-riesgo">
            {errorNit}
          </p>
        )}
      </div>

      <div>
        <p id={`${id}-rut-etiqueta`} className="mb-1 font-medium text-wi-secundario">
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
              <p className="text-apoyo text-wi-secundario">{formatTamano(archivo.size)} · listo para validar</p>
            </div>
            <Button
              variant="texto"
              aria-label={`Quitar ${archivo.name}`}
              onClick={() => {
                validar.reset();
                setArchivo(null);
              }}
            >
              Quitar
            </Button>
          </div>
        )}
      </div>

      {validar.isError && <MensajeError error={validar.error} />}

      <div className="flex items-center justify-end gap-3">
        {motivoDeshabilitado && <p className="mr-auto text-apoyo text-wi-secundario">{motivoDeshabilitado}</p>}
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" variant="principal" disabled={Boolean(motivoDeshabilitado) || validar.isPending}>
          {validar.isPending ? "Validando RUT…" : "Validar RUT"}
        </Button>
      </div>
    </form>
  );
}
