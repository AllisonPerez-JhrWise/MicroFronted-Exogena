"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { IconoMas } from "@/shared/ui/iconos";
import { useBuscarGrupos } from "../../hooks/use-grupos";
import { normalizarNombre, type SeleccionGrupo } from "../../schemas/grupo.schema";

interface SelectorGrupoProps {
  valor: SeleccionGrupo | null;
  onCambio: (grupo: SeleccionGrupo | null) => void;
}

const empresas = (n: number) => `${n} ${n === 1 ? "empresa" : "empresas"}`;

type Opcion = { clave: string; seleccion: SeleccionGrupo; titulo: string; apoyo: string; nueva?: boolean };

/**
 * Lista desplegable opcional del catálogo de grupos (GET /groups). Si el grupo escrito
 * no está, ofrece agregarlo: se crea junto con el cliente (group_name en POST /clients).
 */
export function SelectorGrupo({ valor, onCambio }: SelectorGrupoProps) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const busqueda = useBuscarGrupos(texto, abierto && !valor);

  const escrito = texto.trim();
  const grupos = busqueda.data ?? [];
  // «Agregar» solo si ningún grupo del catálogo se llama igual (sin mayúsculas ni tildes).
  const yaExiste = grupos.some((g) => normalizarNombre(g.name) === normalizarNombre(escrito));
  const opciones: Opcion[] = [
    ...grupos.map((g) => ({
      clave: g.id,
      seleccion: { tipo: "existente", id: g.id, nombre: g.name, empresas: g.companies } as const,
      titulo: g.name,
      apoyo: empresas(g.companies),
    })),
    ...(escrito && !yaExiste && !busqueda.isFetching
      ? [
          {
            clave: "__nuevo__",
            seleccion: { tipo: "nuevo", nombre: escrito } as const,
            titulo: `Agregar «${escrito}» como grupo nuevo`,
            apoyo: "Se crea junto con el cliente",
            nueva: true,
          },
        ]
      : []),
  ];

  const elegir = (seleccion: SeleccionGrupo) => {
    onCambio(seleccion);
    setTexto("");
    setAbierto(false);
  };

  const teclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => Math.min(i + 1, opciones.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && abierto && opciones[activo]) {
      e.preventDefault(); // no enviar el formulario del paso
      elegir(opciones[activo].seleccion);
    } else if (e.key === "Escape" && abierto) {
      // Cierra solo la lista, no la ventana.
      e.preventDefault();
      e.stopPropagation();
      setAbierto(false);
    }
  };

  const estadoLista =
    opciones.length > 0
      ? null
      : busqueda.isPending || busqueda.isFetching
        ? "Buscando…"
        : busqueda.isError
          ? "No se pudo cargar el catálogo de grupos. Intenta de nuevo."
          : "Aún no hay grupos. Escribe el nombre para agregar uno.";

  return (
    <div>
      <label htmlFor={`${id}-buscar`} className="mb-1 block font-medium text-wi-tinta">
        Grupo <span className="text-apoyo font-normal text-wi-secundario">opcional</span>
      </label>

      {valor ? (
        <div className="flex items-center gap-4 rounded-control border border-wi-borde-fuerte bg-wi-superficie px-[10px] py-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-wi-tinta">{valor.nombre}</p>
            <p className="text-apoyo text-wi-secundario">
              {valor.tipo === "nuevo"
                ? "Grupo nuevo · se crea junto con el cliente"
                : valor.empresas !== undefined
                  ? `Grupo existente · ${empresas(valor.empresas)}`
                  : "Grupo existente"}
            </p>
          </div>
          <Button variant="texto" aria-label={`Quitar el grupo ${valor.nombre}`} onClick={() => onCambio(null)}>
            Quitar
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Campo
            id={`${id}-buscar`}
            role="combobox"
            aria-expanded={abierto}
            aria-controls={`${id}-lista`}
            aria-autocomplete="list"
            aria-activedescendant={abierto && opciones[activo] ? `${id}-op-${activo}` : undefined}
            autoComplete="off"
            placeholder="Elige o escribe un grupo"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setActivo(0);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            onBlur={() => setAbierto(false)}
            onKeyDown={teclear}
          />
          {abierto && (
            <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-[240px] overflow-y-auto rounded-tarjeta border border-wi-borde-fuerte bg-wi-superficie p-1">
              {estadoLista ? (
                <p role="status" className="px-2 py-2 text-apoyo text-wi-secundario">
                  {estadoLista}
                </p>
              ) : (
                <ul id={`${id}-lista`} role="listbox" aria-label="Grupos">
                  {opciones.map((o, i) => (
                    <li
                      key={o.clave}
                      id={`${id}-op-${i}`}
                      role="option"
                      aria-selected={i === activo}
                      // mousedown para elegir antes de que el campo pierda el foco
                      onMouseDown={(e) => {
                        e.preventDefault();
                        elegir(o.seleccion);
                      }}
                      onMouseEnter={() => setActivo(i)}
                      className={`flex cursor-pointer items-start gap-2 rounded-control px-2 py-2 ${i === activo ? "bg-wi-hover" : ""}`}
                    >
                      {o.nueva && <IconoMas className="mt-[3px] shrink-0 text-wi-tinta" />}
                      <span>
                        <span className="block text-wi-tinta">{o.titulo}</span>
                        <span className="block text-apoyo text-wi-secundario">{o.apoyo}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      <p className="mt-1 text-apoyo text-wi-secundario">Junta varias empresas de un mismo cliente.</p>
    </div>
  );
}
