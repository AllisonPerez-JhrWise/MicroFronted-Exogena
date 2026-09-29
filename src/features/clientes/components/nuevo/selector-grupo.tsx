"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { useBuscarClientes } from "../../hooks/use-clientes-existentes";
import type { ClienteExistente } from "../../schemas/cliente-existente.schema";

interface SelectorGrupoProps {
  valor: ClienteExistente | null;
  onCambio: (cliente: ClienteExistente | null) => void;
}

const plural = (n: number) => `${n} ${n === 1 ? "empresa" : "empresas"}`;

/**
 * Lista desplegable opcional para asociar la empresa a un cliente existente (grupo).
 * Busca en GET /clients/search mientras se escribe (patrón combobox de ARIA).
 */
export function SelectorGrupo({ valor, onCambio }: SelectorGrupoProps) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const busqueda = useBuscarClientes(texto);
  const resultados = busqueda.activa ? (busqueda.data ?? []) : [];

  const elegir = (cliente: ClienteExistente) => {
    onCambio(cliente);
    setTexto("");
    setAbierto(false);
  };

  const teclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && abierto && resultados[activo]) {
      e.preventDefault(); // no enviar el formulario del paso
      elegir(resultados[activo]);
    } else if (e.key === "Escape" && abierto) {
      // Cierra solo la lista, no la ventana.
      e.preventDefault();
      e.stopPropagation();
      setAbierto(false);
    }
  };

  const estadoLista = !busqueda.activa
    ? `Escribe al menos ${busqueda.minCaracteres} letras del cliente o de una de sus empresas.`
    : busqueda.isPending
      ? "Buscando…"
      : busqueda.isError
        ? "No se pudo buscar. Intenta de nuevo."
        : resultados.length === 0
          ? "Ningún cliente coincide."
          : null;

  return (
    <div>
      <label htmlFor={`${id}-buscar`} className="mb-1 block font-medium text-wi-tinta">
        Grupo <span className="text-apoyo font-normal text-wi-secundario">opcional</span>
      </label>

      {valor ? (
        <div className="flex items-center gap-4 rounded-control border border-wi-borde-fuerte bg-wi-superficie px-[10px] py-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-wi-tinta">{valor.name}</p>
            <p className="text-apoyo text-wi-secundario">
              Cliente existente · {plural(valor.companies)}
            </p>
          </div>
          <Button variant="texto" aria-label={`Quitar el grupo ${valor.name}`} onClick={() => onCambio(null)}>
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
            aria-activedescendant={abierto && resultados[activo] ? `${id}-op-${activo}` : undefined}
            autoComplete="off"
            placeholder="Busca un cliente existente"
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
            <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-tarjeta border border-wi-borde-fuerte bg-wi-superficie p-1">
              {estadoLista ? (
                <p role="status" className="px-2 py-2 text-apoyo text-wi-secundario">
                  {estadoLista}
                </p>
              ) : (
                <ul id={`${id}-lista`} role="listbox" aria-label="Clientes existentes">
                  {resultados.map((c, i) => (
                    <li
                      key={c.id}
                      id={`${id}-op-${i}`}
                      role="option"
                      aria-selected={i === activo}
                      // mousedown para elegir antes de que el campo pierda el foco
                      onMouseDown={(e) => {
                        e.preventDefault();
                        elegir(c);
                      }}
                      onMouseEnter={() => setActivo(i)}
                      className={`cursor-pointer rounded-control px-2 py-2 ${i === activo ? "bg-wi-hover" : ""}`}
                    >
                      <span className="block text-wi-tinta">{c.name}</span>
                      <span className="block text-apoyo text-wi-secundario">
                        {plural(c.companies)}
                        {c.contact_name && ` · ${c.contact_name}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      <p className="mt-1 text-apoyo text-wi-secundario">
        Asocia la empresa a un cliente que ya existe, por ejemplo a su grupo empresarial.
      </p>
    </div>
  );
}
