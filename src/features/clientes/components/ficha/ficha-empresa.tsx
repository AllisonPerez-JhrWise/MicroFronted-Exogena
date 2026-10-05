"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ApiError } from "@/lib/http/api-error";
import { MensajeError } from "@/shared/components/query-state";
import { formatFecha, formatNit, VACIO } from "@/shared/lib/format";
import { Button, buttonClasses } from "@/shared/ui/button";
import { Estado, tonoEstado } from "@/shared/ui/estado";
import { IconoMas } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import { usePersonasFirma } from "../../hooks/use-catalogos";
import { useFichaEmpresa } from "../../hooks/use-ficha-empresa";
import { useRutEmpresa } from "../../hooks/use-rut";
import { digitoDe, type EstadoCliente } from "../../schemas/cliente.schema";
import { etiquetaEstadoRut, nombreDelRut, type Rut } from "../../schemas/rut.schema";
import { nombreCompromiso, type CompromisoFicha, type FichaEmpresa } from "../../schemas/ficha.schema";

// Los colores salen de tonoEstado: activo verde, inactivo rojo, el resto naranja.
const ESTADO_EMPRESA: Record<EstadoCliente, string> = {
  active: "Activo",
  rut_renewal_due: "RUT por renovar",
  inactive: "Inactivo",
};

const ESTADO_COMPROMISO: Record<string, string> = {
  created: "Creado",
  por_iniciar: "Por iniciar",
  en_curso: "En curso",
  cerrado: "Cerrado",
};

/** Etiqueta de un estado de compromiso; si llega uno nuevo, se muestra legible igual. */
const estadoCompromiso = (s: string) =>
  ESTADO_COMPROMISO[s] ?? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

const PROXIMAMENTE = "Disponible próximamente";

// ---------------------------------------------------------------------------

function Tarjeta({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <section className="rounded-tarjeta border border-wi-borde bg-wi-superficie p-5">
      <h2 className="mb-4 text-tarjeta font-semibold text-wi-tinta">
        {titulo}
        {nota && <span className="ml-2 text-apoyo font-normal text-wi-secundario">{nota}</span>}
      </h2>
      {children}
    </section>
  );
}

/** Lista de datos etiqueta–valor sobre fondo gris claro. */
function ListaDatos({ filas }: { filas: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-3 rounded-tarjeta border border-wi-borde bg-wi-lienzo p-4">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="contents">
          <dt className="text-wi-secundario">{etiqueta}</dt>
          <dd className="min-w-0 wrap-anywhere text-wi-tinta">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Esqueleto() {
  return (
    <div aria-hidden className="grid grid-cols-[minmax(0,1fr)] gap-5 amplio:grid-cols-[380px_minmax(0,1fr)]">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-col gap-5">
          {[0, 1].map((i) => (
            <div key={i} className="h-[220px] rounded-tarjeta border border-wi-borde bg-wi-neutro-fondo" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

const unir = (partes: (string | null | undefined)[], separador: string) =>
  partes.filter(Boolean).join(separador) || VACIO;

/** Código de la casilla 53 con dos dígitos, como en el RUT: «5» → «05». */
const codigo = (c: string) => c.padStart(2, "0");

/**
 * Datos del RUT. El detalle (dirección, municipio, CIIU, casilla 53, estado, versiones) viene
 * de extracción; si no responde, se muestra lo que guarda exógena y se avisa en la tarjeta.
 */
function DatosRut({ ficha }: { ficha: FichaEmpresa }) {
  const c = ficha.company;
  const { data, error, isPending, refetch } = useRutEmpresa(c.id);
  const sinRut = error instanceof ApiError && error.status === 404;

  if (isPending) {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">Cargando el RUT…</span>
        <div aria-hidden className="h-[200px] rounded-tarjeta border border-wi-borde bg-wi-neutro-fondo" />
      </div>
    );
  }

  const actual: Rut | undefined = data?.current;
  // Versión vigente = anteriores + 1, como en el mockup («05 sep 2026 · versión 3»).
  const version = data ? data.previous_versions.length + 1 : null;
  const fechaActualizado = actual?.rut_updated_at ?? (ficha.rut_date_unknown ? null : c.rut_updated_at);
  const actualizado = fechaActualizado
    ? `${formatFecha(fechaActualizado)}${version ? ` · versión ${version}` : ""}`
    : "Sin identificar";
  const estado = actual?.rut_status ?? null;

  const filas: [string, ReactNode][] = [
    [
      "NIT",
      <span key="nit" className="whitespace-nowrap tabular-nums">
        {formatNit(c.nit, actual?.check_digit ?? digitoDe(c))}
      </span>,
    ],
    ["Razón social", (actual && nombreDelRut(actual)) || c.legal_name || c.display_name],
  ];
  if (actual) {
    filas.push(
      ["Dirección", actual.address ?? VACIO],
      ["Ciudad", unir([actual.city, actual.department], " · ")],
      ["Actividad principal", unir([actual.main_activity_code, actual.main_activity_description], " · ")],
      [
        "Responsabilidades",
        unir(actual.tax_responsibilities.map((r) => `${codigo(r.code)} · ${r.description}`), ", "),
      ],
      [
        "Estado del RUT",
        // Activo en verde; suspendido, cancelado o sin identificar, en naranja (regla de cápsulas).
        <Estado key="estado" tono={tonoEstado(estado ?? "sin_identificar")}>
          {etiquetaEstadoRut(estado)}
        </Estado>,
      ],
    );
  } else {
    filas.push(["Tipo", c.taxpayer_type ?? VACIO]);
  }
  filas.push(["Actualizado", actualizado]);

  return (
    <div className="flex flex-col gap-3">
      <ListaDatos filas={filas} />
      {sinRut ? (
        <p className="text-apoyo text-wi-secundario">Esta empresa aún no tiene el RUT cargado en el sistema de lectura.</p>
      ) : (
        error && (
          <p className="flex flex-wrap items-center gap-2 text-apoyo text-wi-riesgo">
            No se pudo consultar el RUT, intenta de nuevo.
            <Button variant="texto" onClick={() => refetch()}>
              Reintentar
            </Button>
          </p>
        )
      )}
    </div>
  );
}

function DatosOrganizacion({ ficha }: { ficha: FichaEmpresa }) {
  const c = ficha.company;
  return (
    <ListaDatos
      filas={[
        ["Nombre comercial", c.trade_name ?? VACIO],
        ["Contacto principal", c.contact_name ?? VACIO],
        ["Correo", c.contact_email ?? VACIO],
        ["Teléfono", c.contact_phone ? <span className="tabular-nums">{c.contact_phone}</span> : VACIO],
      ]}
    />
  );
}

type Persona = CompromisoFicha["partner"];

function Compromisos({ compromisos }: { compromisos: CompromisoFicha[] }) {
  // Los nombres salen de los miembros de la firma (Identidad), la misma consulta del paso
  // «Compromisos». Si Identidad no responde, se usa full_name si vino; si no, «—».
  const personas = usePersonasFirma();
  const nombre = (p: Persona) => (p ? (personas.data?.find((x) => x.id === p.user_id)?.nombre ?? p.full_name) : null);

  if (!compromisos.length) return <p className="text-wi-secundario">Esta empresa aún no tiene compromisos.</p>;

  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="wi-tabla">
          <thead>
            <tr>
              <th scope="col">Compromiso</th>
              <th scope="col" className="num">
                Año gravable
              </th>
              <th scope="col">Equipo</th>
              <th scope="col">Estado</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {compromisos.map((c) => (
              <tr key={c.id}>
                <td>{nombreCompromiso(c)}</td>
                <td className="num">{c.fiscal_year}</td>
                <td>{[nombre(c.partner), nombre(c.manager)].filter(Boolean).join(" · ") || VACIO}</td>
                <td>
                  <Estado tono={tonoEstado(c.status)}>{estadoCompromiso(c.status)}</Estado>
                </td>
                <td className="text-right">
                  <Button variant="texto" disabled title={PROXIMAMENTE}>
                    Abrir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-apoyo text-wi-secundario">El detalle de cada compromiso estará disponible próximamente.</p>
    </>
  );
}

function OtrasEmpresas({ ficha }: { ficha: FichaEmpresa }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="wi-tabla">
        <thead>
          <tr>
            <th scope="col">Empresa</th>
            <th scope="col">NIT</th>
            <th scope="col">Estado</th>
            <th scope="col">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ficha.group_companies.map((e) => (
            <tr key={e.id}>
              <td>{e.display_name}</td>
              <td className="whitespace-nowrap tabular-nums">{formatNit(e.nit, digitoDe(e))}</td>
              <td>
                <Estado tono={tonoEstado(e.status)}>{ESTADO_EMPRESA[e.status]}</Estado>
              </td>
              <td className="text-right">
                <Link
                  href={`/clientes/${encodeURIComponent(e.id)}`}
                  aria-label={`Ver ${e.display_name}`}
                  className={buttonClasses("texto")}
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Ficha de la empresa (se abre con «Ver» desde el listado de clientes). */
export function FichaEmpresaVista({ id }: { id: string }) {
  const { data: ficha, error, isPending, refetch } = useFichaEmpresa(id);

  if (error) {
    // 404: no existe o quien consulta no puede verla (la API no distingue, a propósito).
    if (error instanceof ApiError && error.status === 404) {
      return (
        <Mensaje
          nivel="bloqueo"
          titulo="No se encontró la empresa"
          accion={
            <Link href="/clientes" className={buttonClasses("secundaria")}>
              Volver a clientes
            </Link>
          }
        >
          <p>Puede que no exista o que no tengas acceso a ella.</p>
        </Mensaje>
      );
    }
    return <MensajeError error={error} onRetry={() => refetch()} />;
  }

  if (isPending) {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">Cargando la ficha de la empresa…</span>
        <Esqueleto />
      </div>
    );
  }

  const { company } = ficha;
  const estado = { etiqueta: ESTADO_EMPRESA[ficha.status], tono: tonoEstado(ficha.status) };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-5">
        <h1 className="text-pantalla font-semibold tracking-[-0.01em] text-wi-tinta">{company.display_name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Estado tono={estado.tono}>{estado.etiqueta}</Estado>
          {company.group && <span className="text-apoyo text-wi-secundario">{company.group.name}</span>}
          <Button disabled title={PROXIMAMENTE}>
            Actualizar RUT
          </Button>
          <Button disabled title={PROXIMAMENTE}>
            Editar datos
          </Button>
          <Button variant="principal" disabled title={PROXIMAMENTE}>
            <IconoMas />
            Agregar empresa al grupo
          </Button>
        </div>
        <p className="w-full text-right text-apoyo text-wi-secundario">
          Actualizar el RUT, editar los datos y agregar empresas al grupo estarán disponibles próximamente.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 amplio:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Tarjeta titulo="Datos del RUT" nota="no editables">
            <DatosRut ficha={ficha} />
          </Tarjeta>
          <Tarjeta titulo="Datos de la organización">
            <DatosOrganizacion ficha={ficha} />
          </Tarjeta>
        </div>

        <div className="flex flex-col gap-5">
          <Tarjeta titulo="Compromisos de esta empresa">
            <Compromisos compromisos={ficha.engagements} />
          </Tarjeta>
          {company.group && ficha.group_companies.length > 0 && (
            <Tarjeta titulo={`Otras empresas del ${company.group.name}`}>
              <OtrasEmpresas ficha={ficha} />
            </Tarjeta>
          )}
          <Tarjeta titulo="Documentos">
            <p className="flex flex-wrap items-center gap-3 text-wi-secundario">
              RUT y demás documentos maestros de esta empresa.
              <Button variant="texto" disabled title={PROXIMAMENTE}>
                Abrir carpeta
              </Button>
              <span className="text-apoyo">(próximamente)</span>
            </p>
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
