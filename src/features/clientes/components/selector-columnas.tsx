"use client";

import { useState } from "react";
import { buttonClasses } from "@/shared/ui/button";
import { Casilla } from "@/shared/ui/campo";
import { Desplegable } from "@/shared/ui/desplegable";
import { COLUMNAS_CLIENTE, DEFINICION_COLUMNAS, type ColumnaCliente } from "./columnas";

interface SelectorColumnasProps {
  esVisible: (columna: ColumnaCliente) => boolean;
  onAlternar: (columna: ColumnaCliente) => void;
}

export function SelectorColumnas({ esVisible, onAlternar }: SelectorColumnasProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Desplegable
      etiqueta="Columnas visibles"
      abierto={abierto}
      onCambio={setAbierto}
      alinear="fin"
      ancho="w-[240px]"
      disparador={(props) => (
        <button type="button" {...props} className={buttonClasses("secundaria")}>
          Columnas
        </button>
      )}
    >
      <p className="mb-2 px-2 text-apoyo text-wi-secundario">Mostrar columnas</p>
      {COLUMNAS_CLIENTE.map((columna) => {
        const { titulo, obligatoria } = DEFINICION_COLUMNAS[columna];
        return (
          <Casilla
            key={columna}
            etiqueta={titulo}
            nota={obligatoria ? "Obligatoria" : undefined}
            checked={esVisible(columna)}
            disabled={obligatoria}
            onChange={() => onAlternar(columna)}
          />
        );
      })}
    </Desplegable>
  );
}
