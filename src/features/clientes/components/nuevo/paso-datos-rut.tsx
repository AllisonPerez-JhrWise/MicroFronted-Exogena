"use client";

import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { formatFecha, formatNit, VACIO } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { Estado } from "@/shared/ui/estado";
import { IconoAtras } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import {
  organizacionSchema,
  type CampoOrganizacion,
  type Organizacion,
} from "../../schemas/organizacion.schema";
import type { RutValidado } from "../../schemas/rut.schema";

const TIPO_PERSONA: Record<RutValidado["tipoPersona"], string> = {
  JURIDICA: "Persona jurídica",
  NATURAL: "Persona natural",
};

const ESTADO_RUT: Record<RutValidado["estado"], { etiqueta: string; tono: "ok" | "neutro" }> = {
  ACTIVO: { etiqueta: "Activo", tono: "ok" },
  INACTIVO: { etiqueta: "Inactivo", tono: "neutro" },
};

const unir = (partes: (string | null | undefined)[], separador: string) =>
  partes.filter(Boolean).join(separador) || VACIO;

// ---------------------------------------------------------------------------

function EncabezadoColumna({ id, titulo, nota }: { id: string; titulo: string; nota: string }) {
  return (
    <h3 id={id} className="mb-3 text-tarjeta font-semibold text-wi-tinta">
      {titulo} <span className="ml-1 text-apoyo font-normal text-wi-secundario">{nota}</span>
    </h3>
  );
}

function DatosRut({ rut }: { rut: RutValidado }) {
  const filas: [string, ReactNode][] = [
    ["NIT", <span key="nit" className="tabular-nums">{formatNit(rut.nit, rut.digitoVerificacion)}</span>],
    ["Razón social", rut.razonSocial],
    ["Tipo", TIPO_PERSONA[rut.tipoPersona]],
    ["Dirección", rut.direccion ?? VACIO],
    ["Ciudad", unir([rut.ciudad, rut.departamento], " · ")],
    ["Correo", rut.correo ?? VACIO],
    [
      "Actividad principal",
      rut.actividadPrincipal ? `${rut.actividadPrincipal.codigo} · ${rut.actividadPrincipal.descripcion}` : VACIO,
    ],
    ["Responsabilidades", unir(rut.responsabilidades.map((r) => `${r.codigo} · ${r.descripcion}`), ", ")],
    [
      "Estado del RUT",
      <Estado key="estado" tono={ESTADO_RUT[rut.estado].tono}>
        {ESTADO_RUT[rut.estado].etiqueta}
      </Estado>,
    ],
    ["Actualizado", formatFecha(rut.actualizado)],
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 rounded-tarjeta border border-wi-borde bg-wi-lienzo p-4">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="contents">
          <dt className="text-wi-secundario">{etiqueta}</dt>
          <dd className="break-words text-wi-tinta">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

interface CampoFormularioProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  etiqueta: string;
  error?: string;
}

function CampoFormulario({ id, etiqueta, error, className = "", ...props }: CampoFormularioProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium text-wi-tinta">
        {etiqueta}
      </label>
      <Campo
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${error ? "border-wi-riesgo" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-apoyo text-wi-riesgo">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type Errores = Partial<Record<CampoOrganizacion, string>>;

const CAMPOS: {
  campo: CampoOrganizacion;
  etiqueta: string;
  props: InputHTMLAttributes<HTMLInputElement>;
}[] = [
  { campo: "nombreComercial", etiqueta: "Nombre comercial", props: { autoComplete: "organization" } },
  { campo: "contactoPrincipal", etiqueta: "Contacto principal", props: { autoComplete: "name" } },
  { campo: "correoContacto", etiqueta: "Correo de contacto", props: { type: "email", autoComplete: "email" } },
  { campo: "telefono", etiqueta: "Teléfono", props: { type: "tel", autoComplete: "tel", inputMode: "tel" } },
  { campo: "notas", etiqueta: "Notas", props: { placeholder: "Opcional" } },
];

function errorDe(campo: CampoOrganizacion, valor: string) {
  const resultado = organizacionSchema.shape[campo].safeParse(valor);
  return resultado.success ? undefined : resultado.error.issues[0]?.message;
}

interface PasoDatosRutProps {
  rut: RutValidado;
  organizacionInicial: Organizacion;
  /** Devuelve lo diligenciado para no perderlo al volver. */
  onAtras: (organizacion: Organizacion) => void;
  onSiguiente: (organizacion: Organizacion) => void;
}

export function PasoDatosRut({ rut, organizacionInicial, onAtras, onSiguiente }: PasoDatosRutProps) {
  const id = useId();
  const [valores, setValores] = useState<Organizacion>(organizacionInicial);
  const [errores, setErrores] = useState<Errores>({});

  const cambiar = (campo: CampoOrganizacion, valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    // Si el campo ya mostraba error, se reevalúa mientras se corrige.
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: errorDe(campo, valor) }));
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const resultado = organizacionSchema.safeParse(valores);
    if (resultado.success) return onSiguiente(resultado.data);

    const nuevos: Errores = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0] as CampoOrganizacion;
      nuevos[campo] ??= issue.message;
    }
    setErrores(nuevos);
    const primero = CAMPOS.find(({ campo }) => nuevos[campo]);
    if (primero) document.getElementById(`${id}-${primero.campo}`)?.focus();
  };

  const fecha = rut.actualizado ? `, actualizado el ${formatFecha(rut.actualizado)}` : "";
  const estadoTexto = ESTADO_RUT[rut.estado].etiqueta.toLowerCase();

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      {/* Solo se llega aquí si el NIT coincide: si no, el paso 1 bloquea el avance. */}
      <Mensaje nivel="confirmacion" titulo="El NIT coincide con el del RUT">
        <p>
          RUT {estadoTexto}
          {fecha}.
        </p>
      </Mensaje>

      <div className="grid gap-6 amplio:grid-cols-2">
        <section aria-labelledby={`${id}-rut`}>
          <EncabezadoColumna id={`${id}-rut`} titulo="Datos del RUT" nota="no editables" />
          <DatosRut rut={rut} />
        </section>

        <section aria-labelledby={`${id}-org`}>
          <EncabezadoColumna id={`${id}-org`} titulo="Datos de la organización" nota="editables" />
          <div className="flex flex-col gap-4">
            {CAMPOS.map(({ campo, etiqueta, props }, i) => (
              <CampoFormulario
                key={campo}
                id={`${id}-${campo}`}
                etiqueta={etiqueta}
                value={valores[campo]}
                error={errores[campo]}
                onChange={(e) => cambiar(campo, e.target.value)}
                // Al salir se revisa el formato de lo escrito; los vacíos se señalan al pulsar «Siguiente».
                onBlur={(e) => {
                  if (e.target.value.trim()) setErrores((er) => ({ ...er, [campo]: errorDe(campo, e.target.value) }));
                }}
                autoFocus={i === 0}
                {...props}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={() => onAtras(valores)}>
          <IconoAtras />
          Atrás
        </Button>
        <Button type="submit" variant="principal">
          Siguiente
        </Button>
      </div>
    </form>
  );
}
