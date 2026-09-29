"use client";

import { useId, useState } from "react";
import { MensajeError } from "@/shared/components/query-state";
import { formatFecha, VACIO } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo, Selector } from "@/shared/ui/campo";
import { IconoAtras, IconoMas } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import { useMiembros, useObligaciones, useTiposServicio } from "../../hooks/use-catalogos";
import type { Compromiso, PersonaEquipo } from "../../schemas/compromiso.schema";

/** Años gravables que se ofrecen: el anterior (por defecto), dos atrás y el actual. */
function aniosGravables() {
  const actual = new Date().getFullYear();
  return [actual, actual - 1, actual - 2];
}

// ---------------------------------------------------------------------------

interface FilaNuevaProps {
  existentes: Compromiso[];
  onGuardar: (compromiso: Compromiso) => void;
  onCancelar: () => void;
}

interface SelectorEquipoProps {
  etiqueta: string;
  consulta: { data?: PersonaEquipo[]; isPending: boolean; isError: boolean };
  value: string;
  onChange: (id: string) => void;
}

/** Selector de una persona del equipo (socio, gerente). Opcional: si el catálogo falla, queda deshabilitado. */
function SelectorEquipo({ etiqueta, consulta, value, onChange }: SelectorEquipoProps) {
  return (
    <Selector
      aria-label={etiqueta}
      value={value}
      disabled={consulta.isPending || consulta.isError}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{consulta.isPending ? "Cargando…" : consulta.isError ? "No disponible" : "Elige"}</option>
      {consulta.data?.map((p) => (
        <option key={p.user_id} value={p.user_id}>
          {p.full_name}
        </option>
      ))}
    </Selector>
  );
}

/** Fila editable al final de la tabla para agregar un compromiso. */
function FilaNuevoCompromiso({ existentes, onGuardar, onCancelar }: FilaNuevaProps) {
  const id = useId();
  const anios = aniosGravables();
  const [obligacionId, setObligacionId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [anio, setAnio] = useState(anios[1]);
  const [vencimiento, setVencimiento] = useState("");
  const [socioId, setSocioId] = useState("");
  const [gerenteId, setGerenteId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const obligaciones = useObligaciones();
  const tipos = useTiposServicio(obligacionId || null);
  const socios = useMiembros("socio");
  const gerentes = useMiembros("gerente");
  const obligacion = obligaciones.data?.find((o) => o.id === obligacionId);
  const tipo = tipos.data?.find((t) => t.id === tipoId);
  const socio = socios.data?.find((s) => s.user_id === socioId);
  const gerente = gerentes.data?.find((g) => g.user_id === gerenteId);
  const equipoNoDisponible = [socios.isError && "socios", gerentes.isError && "gerentes"].filter(Boolean);
  const sinServicios = Boolean(obligacionId) && tipos.data?.length === 0;

  const guardar = () => {
    if (!obligacion) return setError("Elige la obligación.");
    if (!tipo) return setError("Elige el tipo de servicio.");
    if (obligacion.requires_due_date && !vencimiento) {
      return setError("Indica el vencimiento: esta obligación lo exige.");
    }
    if (existentes.some((c) => c.serviceId === tipo.service_id && c.anioGravable === anio)) {
      return setError(`Ya agregaste ${obligacion.name} · ${tipo.name} para el año gravable ${anio}.`);
    }
    onGuardar({
      clave: `${tipo.service_id}-${anio}`,
      obligacionId: obligacion.id,
      obligacionNombre: obligacion.name,
      tipoServicioNombre: tipo.name,
      serviceId: tipo.service_id,
      anioGravable: anio,
      vencimiento: vencimiento || null,
      socioId: socio?.user_id ?? null,
      socioNombre: socio?.full_name ?? null,
      gerenteId: gerente?.user_id ?? null,
      gerenteNombre: gerente?.full_name ?? null,
    });
  };

  const cambio = <T,>(set: (v: T) => void) => (v: T) => {
    setError(null);
    set(v);
  };

  if (obligaciones.isError) {
    return (
      <tr>
        <td colSpan={7}>
          <MensajeError error={obligaciones.error} onRetry={() => obligaciones.refetch()} />
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr>
        <td>
          <Selector
            aria-label="Obligación"
            value={obligacionId}
            disabled={obligaciones.isPending}
            autoFocus
            onChange={(e) => {
              cambio(setObligacionId)(e.target.value);
              setTipoId("");
            }}
          >
            <option value="">{obligaciones.isPending ? "Cargando…" : "Elige la obligación"}</option>
            {obligaciones.data?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Selector>
        </td>
        <td>
          <Selector
            aria-label="Tipo de servicio"
            value={tipoId}
            disabled={!obligacionId || tipos.isPending || sinServicios}
            onChange={(e) => cambio(setTipoId)(e.target.value)}
          >
            <option value="">{obligacionId && tipos.isPending ? "Cargando…" : "Elige el tipo"}</option>
            {tipos.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Selector>
        </td>
        <td className="num">
          <Selector
            aria-label="Año gravable"
            value={anio}
            onChange={(e) => cambio(setAnio)(Number(e.target.value))}
          >
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Selector>
        </td>
        <td className="num">
          <Campo
            type="date"
            aria-label={obligacion?.requires_due_date === false ? "Vencimiento (opcional)" : "Vencimiento"}
            aria-describedby={error ? `${id}-error` : undefined}
            value={vencimiento}
            onChange={(e) => cambio(setVencimiento)(e.target.value)}
          />
        </td>
        <td>
          <SelectorEquipo etiqueta="Socio" consulta={socios} value={socioId} onChange={cambio(setSocioId)} />
        </td>
        <td>
          <SelectorEquipo etiqueta="Gerente" consulta={gerentes} value={gerenteId} onChange={cambio(setGerenteId)} />
        </td>
        <td />
      </tr>
      <tr>
        <td colSpan={7}>
          <div className="flex items-center justify-end gap-3">
            <p id={`${id}-error`} role={error ? "alert" : undefined} className="mr-auto text-apoyo">
              {error ? (
                <span className="text-wi-riesgo">{error}</span>
              ) : sinServicios ? (
                <span className="text-wi-secundario">Esta obligación aún no tiene servicios disponibles.</span>
              ) : tipos.isError ? (
                <span className="text-wi-riesgo">No se pudieron cargar los tipos de servicio. Elige de nuevo la obligación.</span>
              ) : equipoNoDisponible.length ? (
                <span className="text-wi-secundario">
                  No se pudo cargar la lista de {equipoNoDisponible.join(" ni de ")}; puedes guardar el compromiso sin
                  ellos.
                </span>
              ) : obligacion && !obligacion.requires_due_date ? (
                <span className="text-wi-secundario">El vencimiento es opcional para esta obligación.</span>
              ) : null}
            </p>
            <Button variant="texto" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={sinServicios}>
              Guardar compromiso
            </Button>
          </div>
        </td>
      </tr>
    </>
  );
}

// ---------------------------------------------------------------------------

interface PasoCompromisosProps {
  compromisosIniciales: Compromiso[];
  onAtras: (compromisos: Compromiso[]) => void;
  onOmitir: () => void;
  onSiguiente: (compromisos: Compromiso[]) => void;
}

export function PasoCompromisos({ compromisosIniciales, onAtras, onOmitir, onSiguiente }: PasoCompromisosProps) {
  const [compromisos, setCompromisos] = useState<Compromiso[]>(compromisosIniciales);
  const [agregando, setAgregando] = useState(false);
  const hayTabla = compromisos.length > 0 || agregando;

  return (
    <div className="flex flex-col gap-5">
      {hayTabla ? (
        <div className="overflow-x-auto rounded-tarjeta border border-wi-borde">
          <table className="wi-tabla">
            <thead>
              <tr>
                <th scope="col">Obligación</th>
                <th scope="col">Tipo de servicio</th>
                <th scope="col" className="num">
                  Año gravable
                </th>
                <th scope="col" className="num">
                  Vencimiento
                </th>
                <th scope="col">Socio</th>
                <th scope="col">Gerente</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {compromisos.map((c) => (
                <tr key={c.clave}>
                  <td>{c.obligacionNombre}</td>
                  <td>{c.tipoServicioNombre}</td>
                  <td className="num">{c.anioGravable}</td>
                  <td className="num">{c.vencimiento ? formatFecha(c.vencimiento) : VACIO}</td>
                  <td>{c.socioNombre ?? VACIO}</td>
                  <td>{c.gerenteNombre ?? VACIO}</td>
                  <td className="text-right">
                    <Button
                      variant="texto"
                      aria-label={`Quitar ${c.obligacionNombre} ${c.anioGravable}`}
                      onClick={() => setCompromisos((cs) => cs.filter((x) => x.clave !== c.clave))}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              ))}
              {agregando && (
                <FilaNuevoCompromiso
                  existentes={compromisos}
                  onCancelar={() => setAgregando(false)}
                  onGuardar={(nuevo) => {
                    setCompromisos((cs) => [...cs, nuevo]);
                    setAgregando(false);
                  }}
                />
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-wi-secundario">Aún no hay compromisos para este cliente.</p>
      )}

      {!agregando && (
        <div>
          <Button variant="texto" onClick={() => setAgregando(true)}>
            <IconoMas />
            Agregar compromiso
          </Button>
        </div>
      )}

      <Mensaje nivel="informativo" titulo="Cada compromiso nace con las fases y etapas de su servicio">
        <p>El senior y los asociados se asignan después, desde el equipo de cada compromiso.</p>
      </Mensaje>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="mr-auto max-w-[240px] text-apoyo text-wi-secundario">
          {agregando
            ? "Guarda o cancela el compromiso en edición para continuar."
            : "Puedes omitir este paso y crear los compromisos después."}
        </p>
        <Button onClick={() => onAtras(compromisos)}>
          <IconoAtras />
          Atrás
        </Button>
        <Button onClick={onOmitir}>Omitir</Button>
        <Button variant="principal" disabled={agregando} onClick={() => onSiguiente(compromisos)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
