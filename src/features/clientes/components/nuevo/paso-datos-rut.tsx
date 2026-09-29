"use client";

import { Fragment, useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { formatFecha, formatNit, VACIO } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { Estado, tonoEstado, type EstadoTono } from "@/shared/ui/estado";
import { IconoAtras } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import {
  NOTAS_MAX,
  organizacionSchema,
  type CampoOrganizacion,
  type Organizacion,
} from "../../schemas/organizacion.schema";
import type { SeleccionGrupo } from "../../schemas/grupo.schema";
import { nombreDelRut, type RutValidado } from "../../schemas/rut.schema";
import { SelectorGrupo } from "./selector-grupo";

const TIPO_PERSONA: Record<RutValidado["person_type"], string> = {
  juridica: "Persona jurídica",
  natural: "Persona natural",
};

// Color según la regla de cápsulas del proyecto (ver tonoEstado).
const ESTADO_RUT: Record<RutValidado["rut_status"], { etiqueta: string; tono: EstadoTono }> = {
  activo: { etiqueta: "Activo", tono: tonoEstado("activo") },
  suspendido: { etiqueta: "Suspendido", tono: tonoEstado("suspendido") },
  cancelado: { etiqueta: "Cancelado", tono: tonoEstado("cancelado") },
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
    ["NIT", <span key="nit" className="tabular-nums">{formatNit(rut.nit, rut.dv)}</span>],
    [rut.person_type === "juridica" ? "Razón social" : "Nombre", nombreDelRut(rut) || VACIO],
    ["Tipo", TIPO_PERSONA[rut.person_type]],
    ["Dirección", rut.address ?? VACIO],
    ["Ciudad", unir([rut.city_name, rut.department_name], " · ")],
    ["Correo", rut.rut_email ?? VACIO],
    ["Actividad principal", unir([rut.main_activity_code, rut.main_activity_description], " · ")],
    ["Responsabilidades", unir(rut.tax_responsibilities.map((r) => `${r.code} · ${r.description}`), ", ")],
    [
      "Estado del RUT",
      <Estado key="estado" tono={ESTADO_RUT[rut.rut_status].tono}>
        {ESTADO_RUT[rut.rut_status].etiqueta}
      </Estado>,
    ],
    ["Actualizado", formatFecha(rut.rut_updated_at)],
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
  { campo: "notas", etiqueta: "Notas", props: { placeholder: "Opcional", maxLength: NOTAS_MAX } },
];

function errorDe(campo: CampoOrganizacion, valor: string) {
  const resultado = organizacionSchema.shape[campo].safeParse(valor);
  return resultado.success ? undefined : resultado.error.issues[0]?.message;
}

export interface ResultadoPasoDatosRut {
  organizacion: Organizacion;
  grupo: SeleccionGrupo | null;
}

interface PasoDatosRutProps {
  rut: RutValidado;
  organizacionInicial: Organizacion;
  grupoInicial: SeleccionGrupo | null;
  /** Devuelve lo diligenciado para no perderlo al volver. */
  onAtras: (resultado: ResultadoPasoDatosRut) => void;
  onSiguiente: (resultado: ResultadoPasoDatosRut) => void;
}

export function PasoDatosRut({ rut, organizacionInicial, grupoInicial, onAtras, onSiguiente }: PasoDatosRutProps) {
  const id = useId();
  const [valores, setValores] = useState<Organizacion>(organizacionInicial);
  const [errores, setErrores] = useState<Errores>({});
  const [grupo, setGrupo] = useState(grupoInicial);

  const cambiar = (campo: CampoOrganizacion, valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    // Si el campo ya mostraba error, se reevalúa mientras se corrige.
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: errorDe(campo, valor) }));
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const resultado = organizacionSchema.safeParse(valores);
    if (resultado.success) return onSiguiente({ organizacion: resultado.data, grupo });

    const nuevos: Errores = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0] as CampoOrganizacion;
      nuevos[campo] ??= issue.message;
    }
    setErrores(nuevos);
    const primero = CAMPOS.find(({ campo }) => nuevos[campo]);
    if (primero) document.getElementById(`${id}-${primero.campo}`)?.focus();
  };

  const fecha = rut.rut_updated_at ? `, actualizado el ${formatFecha(rut.rut_updated_at)}` : "";
  const estadoTexto = ESTADO_RUT[rut.rut_status].etiqueta.toLowerCase();

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
              <Fragment key={campo}>
                {/* El grupo (opcional) va justo antes de las notas. */}
                {campo === "notas" && <SelectorGrupo valor={grupo} onCambio={setGrupo} />}
                <CampoFormulario
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
              </Fragment>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={() => onAtras({ organizacion: valores, grupo })}>
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
