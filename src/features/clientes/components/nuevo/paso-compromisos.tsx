"use client";

import { useId, useState } from "react";
import { formatFecha } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo, Selector } from "@/shared/ui/campo";
import { IconoAtras, IconoMas } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import { usePersonasFirma } from "../../hooks/use-catalogos";
import { SERVICIO_COMPROMISO, type Compromiso, type PersonaEquipo } from "../../schemas/compromiso.schema";

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

/** Selector de una persona del equipo (socio o gerente). Si la lista no carga, queda deshabilitado. */
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
        <option key={p.id} value={p.id}>
          {p.nombre}
        </option>
      ))}
    </Selector>
  );
}

/** Fila editable al final de la tabla para agregar un compromiso. */
function FilaNuevoCompromiso({ existentes, onGuardar, onCancelar }: FilaNuevaProps) {
  const id = useId();
  const anios = aniosGravables();
  // Por defecto, el año más reciente que aún no tenga compromiso.
  const [anio, setAnio] = useState(() => anios.slice(1).concat(anios[0]).find((a) => !existentes.some((c) => c.anioGravable === a)) ?? anios[1]);
  const [vencimiento, setVencimiento] = useState("");
  const [socioId, setSocioId] = useState("");
  const [gerenteId, setGerenteId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Una sola lista de la firma sirve para socio y gerente.
  const personas = usePersonasFirma();
  const socio = personas.data?.find((p) => p.id === socioId);
  const gerente = personas.data?.find((p) => p.id === gerenteId);
  // Socio y gerente son obligatorios (back_exogena responde 422 si faltan).
  const faltaEquipo = [!socio && "el socio", !gerente && "el gerente"].filter(Boolean);
  // No puede repetirse el año gravable entre los compromisos del mismo cliente.
  const anioRepetido = existentes.some((c) => c.anioGravable === anio);
  // «Guardar compromiso» se habilita con año, vencimiento, socio y gerente.
  const faltantes = [!vencimiento && "el vencimiento", ...faltaEquipo].filter((f): f is string => Boolean(f));

  const guardar = () => {
    if (anioRepetido) return setError(`Ya hay un compromiso para el año gravable ${anio}.`);
    if (!vencimiento) return setError("Indica el vencimiento.");
    if (!socio || !gerente) return setError(`Elige ${faltaEquipo.join(" y ")}.`);
    onGuardar({
      clave: String(anio),
      anioGravable: anio,
      vencimiento,
      inicio: null,
      socioId: socio.id,
      socioNombre: socio.nombre,
      gerenteId: gerente.id,
      gerenteNombre: gerente.nombre,
    });
  };

  const cambio = <T,>(set: (v: T) => void) => (v: T) => {
    setError(null);
    set(v);
  };

  return (
    <>
      <tr>
        <td className="text-wi-secundario">{SERVICIO_COMPROMISO}</td>
        <td className="num">
          <Selector
            aria-label="Año gravable"
            value={anio}
            autoFocus
            aria-invalid={anioRepetido}
            onChange={(e) => cambio(setAnio)(Number(e.target.value))}
          >
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
                {existentes.some((c) => c.anioGravable === a) ? " (ya agregado)" : ""}
              </option>
            ))}
          </Selector>
        </td>
        <td className="num">
          <Campo
            type="date"
            aria-label="Vencimiento"
            aria-describedby={error ? `${id}-error` : undefined}
            value={vencimiento}
            onChange={(e) => cambio(setVencimiento)(e.target.value)}
          />
        </td>
        <td>
          <SelectorEquipo etiqueta="Socio" consulta={personas} value={socioId} onChange={cambio(setSocioId)} />
        </td>
        <td>
          <SelectorEquipo etiqueta="Gerente" consulta={personas} value={gerenteId} onChange={cambio(setGerenteId)} />
        </td>
        <td />
      </tr>
      <tr>
        <td colSpan={6}>
          <div className="flex items-center justify-end gap-3">
            <p id={`${id}-error`} role={error ? "alert" : undefined} className="mr-auto text-apoyo">
              {error ? (
                <span className="text-wi-riesgo">{error}</span>
              ) : anioRepetido ? (
                <span className="text-wi-riesgo">Ya hay un compromiso para el año gravable {anio}. Elige otro año.</span>
              ) : personas.isError ? (
                <span className="text-wi-riesgo">
                  No se pudo cargar la lista de personas de la firma. Intenta de nuevo u omite los compromisos por
                  ahora.{" "}
                  <Button variant="texto" onClick={() => personas.refetch()}>
                    Intentar de nuevo
                  </Button>
                </span>
              ) : faltantes.length && !personas.isPending ? (
                // Si algo está deshabilitado, se dice por qué.
                <span className="text-wi-secundario">Indica {faltantes.join(", ").replace(/, ([^,]*)$/, " y $1")} para guardar.</span>
              ) : null}
            </p>
            <Button variant="texto" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={anioRepetido || faltantes.length > 0}>
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
        <div className="relative overflow-x-auto rounded-tarjeta border border-wi-borde">
          <table className="wi-tabla">
            <thead>
              <tr>
                <th scope="col">Servicio</th>
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
                  <td>{SERVICIO_COMPROMISO}</td>
                  <td className="num">{c.anioGravable}</td>
                  <td className="num">{formatFecha(c.vencimiento)}</td>
                  <td>{c.socioNombre}</td>
                  <td>{c.gerenteNombre}</td>
                  <td className="text-right">
                    <Button
                      variant="texto"
                      aria-label={`Quitar el compromiso de ${c.anioGravable}`}
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
