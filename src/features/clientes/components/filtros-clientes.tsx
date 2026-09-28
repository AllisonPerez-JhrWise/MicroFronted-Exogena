"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Campo, Casilla, Etiqueta } from "@/shared/ui/campo";
import { Desplegable } from "@/shared/ui/desplegable";
import { IconoCerrar, IconoMas } from "@/shared/ui/iconos";
import { ESTADOS_CLIENTE, type ClientesFiltros, type EstadoCliente } from "../schemas/cliente.schema";
import { ESTADO_CLIENTE } from "./columnas";

type CampoFiltro = "empresa" | "nit" | "grupo" | "compromisos" | "estado";

const CAMPOS: { campo: CampoFiltro; etiqueta: string }[] = [
  { campo: "empresa", etiqueta: "Empresa" },
  { campo: "nit", etiqueta: "NIT" },
  { campo: "grupo", etiqueta: "Grupo" },
  { campo: "compromisos", etiqueta: "Compromisos activos" },
  { campo: "estado", etiqueta: "Estado" },
];

const etiquetaDe = (campo: CampoFiltro) => CAMPOS.find((c) => c.campo === campo)!.etiqueta;

function estaActivo(campo: CampoFiltro, f: ClientesFiltros) {
  switch (campo) {
    case "compromisos":
      return f.compromisosMin !== undefined || f.compromisosMax !== undefined;
    case "estado":
      return Boolean(f.estados?.length);
    default:
      return Boolean(f[campo]);
  }
}

function resumen(campo: CampoFiltro, f: ClientesFiltros) {
  switch (campo) {
    case "compromisos": {
      const { compromisosMin: min, compromisosMax: max } = f;
      if (min !== undefined && max !== undefined) return min === max ? `${min}` : `${min} a ${max}`;
      return min !== undefined ? `${min} o más` : `${max} o menos`;
    }
    case "estado":
      return (f.estados ?? []).map((e) => ESTADO_CLIENTE[e].etiqueta).join(", ");
    default:
      return f[campo] ?? "";
  }
}

/** Qué borrar de los filtros al quitar un campo. */
function sinCampo(campo: CampoFiltro): Partial<ClientesFiltros> {
  if (campo === "compromisos") return { compromisosMin: undefined, compromisosMax: undefined };
  if (campo === "estado") return { estados: undefined };
  return { [campo]: undefined };
}

// ---------------------------------------------------------------------------

interface EditorProps {
  campo: CampoFiltro;
  filtros: ClientesFiltros;
  onAplicar: (cambios: Partial<ClientesFiltros>) => void;
  onCancelar: () => void;
}

function EditorFiltro({ campo, filtros, onAplicar, onCancelar }: EditorProps) {
  const [texto, setTexto] = useState(
    campo === "empresa" || campo === "nit" || campo === "grupo" ? (filtros[campo] ?? "") : "",
  );
  const [min, setMin] = useState(filtros.compromisosMin?.toString() ?? "");
  const [max, setMax] = useState(filtros.compromisosMax?.toString() ?? "");
  const [estados, setEstados] = useState<EstadoCliente[]>(filtros.estados ?? []);
  const [error, setError] = useState<string | null>(null);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (campo === "compromisos") {
      const nMin = min === "" ? undefined : Number(min);
      const nMax = max === "" ? undefined : Number(max);
      if (nMin === undefined && nMax === undefined) return setError("Indica un mínimo, un máximo o ambos.");
      if (nMin !== undefined && nMax !== undefined && nMin > nMax) {
        return setError("El mínimo no puede ser mayor que el máximo.");
      }
      return onAplicar({ compromisosMin: nMin, compromisosMax: nMax });
    }
    if (campo === "estado") {
      if (!estados.length) return setError("Elige al menos un estado.");
      return onAplicar({ estados });
    }
    if (!texto.trim()) return setError("Escribe un valor para filtrar.");
    onAplicar({ [campo]: texto.trim() });
  };

  const idCampo = `filtro-${campo}`;

  return (
    <form onSubmit={enviar} noValidate>
      <p className="mb-3 text-tarjeta font-semibold text-wi-tinta">{etiquetaDe(campo)}</p>

      {campo === "compromisos" ? (
        <div className="flex gap-3">
          <div className="flex-1">
            <Etiqueta htmlFor={`${idCampo}-min`}>Mínimo</Etiqueta>
            <Campo
              id={`${idCampo}-min`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex-1">
            <Etiqueta htmlFor={`${idCampo}-max`}>Máximo</Etiqueta>
            <Campo
              id={`${idCampo}-max`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </div>
      ) : campo === "estado" ? (
        <fieldset>
          <legend className="sr-only">Estados</legend>
          {ESTADOS_CLIENTE.map((estado, i) => (
            <Casilla
              key={estado}
              etiqueta={ESTADO_CLIENTE[estado].etiqueta}
              checked={estados.includes(estado)}
              autoFocus={i === 0}
              onChange={(e) =>
                setEstados((actuales) =>
                  e.target.checked ? [...actuales, estado] : actuales.filter((x) => x !== estado),
                )
              }
            />
          ))}
        </fieldset>
      ) : (
        <>
          <Etiqueta htmlFor={idCampo}>Contiene</Etiqueta>
          <Campo
            id={idCampo}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            inputMode={campo === "nit" ? "numeric" : undefined}
            autoFocus
          />
        </>
      )}

      {error && (
        <p role="alert" className="mt-2 text-apoyo text-wi-riesgo">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-3">
        <Button variant="texto" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">Aplicar</Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------

const capsula =
  "inline-flex min-h-7 items-center gap-2 rounded-pildora border px-4 py-[5px] text-nav font-medium transition-colors duration-150";

interface FiltrosClientesProps {
  filtros: ClientesFiltros;
  onActualizar: (cambios: Partial<ClientesFiltros>) => void;
  onLimpiar: () => void;
}

export function FiltrosClientes({ filtros, onActualizar, onLimpiar }: FiltrosClientesProps) {
  // Qué panel está abierto: el de agregar (con o sin campo elegido) o el de editar un filtro.
  const [agregando, setAgregando] = useState<{ abierto: boolean; campo?: CampoFiltro }>({ abierto: false });
  const [editando, setEditando] = useState<CampoFiltro | null>(null);

  const activos = CAMPOS.filter(({ campo }) => estaActivo(campo, filtros));
  const disponibles = CAMPOS.filter(({ campo }) => !estaActivo(campo, filtros));

  const aplicar = (cambios: Partial<ClientesFiltros>) => {
    onActualizar(cambios);
    setAgregando({ abierto: false });
    setEditando(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filtros">
      {activos.map(({ campo, etiqueta }) => (
        <div
          key={campo}
          className={`${capsula} border-wi-marca-linea bg-wi-marca-suave pr-1 text-wi-marca-pantalla`}
        >
          <Desplegable
            etiqueta={`Editar filtro ${etiqueta}`}
            abierto={editando === campo}
            onCambio={(abierto) => setEditando(abierto ? campo : null)}
            disparador={(props) => (
              <button type="button" {...props} className="text-left">
                {etiqueta}: <span className="font-normal">{resumen(campo, filtros)}</span>
              </button>
            )}
          >
            <EditorFiltro
              campo={campo}
              filtros={filtros}
              onAplicar={aplicar}
              onCancelar={() => setEditando(null)}
            />
          </Desplegable>
          <button
            type="button"
            aria-label={`Quitar filtro ${etiqueta}`}
            onClick={() => onActualizar(sinCampo(campo))}
            className="-my-1 flex size-7 items-center justify-center rounded-pildora hover:bg-wi-marca-linea"
          >
            <IconoCerrar />
          </button>
        </div>
      ))}

      {disponibles.length > 0 && (
        <Desplegable
          etiqueta="Agregar filtro"
          abierto={agregando.abierto}
          onCambio={(abierto) => setAgregando({ abierto })}
          disparador={(props) => (
            <button
              type="button"
              {...props}
              className={`${capsula} border-dashed border-wi-borde-fuerte bg-wi-superficie text-wi-tinta hover:bg-wi-hover`}
            >
              <IconoMas />
              Agregar filtro
            </button>
          )}
        >
          {agregando.campo ? (
            <EditorFiltro
              campo={agregando.campo}
              filtros={filtros}
              onAplicar={aplicar}
              onCancelar={() => setAgregando({ abierto: false })}
            />
          ) : (
            <>
              <p className="mb-2 px-2 text-apoyo text-wi-secundario">Filtrar por</p>
              <ul>
                {disponibles.map(({ campo, etiqueta }, i) => (
                  <li key={campo}>
                    <button
                      type="button"
                      autoFocus={i === 0}
                      onClick={() => setAgregando({ abierto: true, campo })}
                      className="flex min-h-7 w-full items-center rounded-control px-2 text-left text-cuerpo text-wi-texto hover:bg-wi-hover"
                    >
                      {etiqueta}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Desplegable>
      )}

      {activos.length > 0 && (
        <Button variant="texto" onClick={onLimpiar}>
          Quitar filtros
        </Button>
      )}
    </div>
  );
}
