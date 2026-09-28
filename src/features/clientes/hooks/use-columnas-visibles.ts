"use client";

import { useEffect, useState } from "react";

const CLAVE = "wise.clientes.columnas-ocultas";

/**
 * Columnas ocultas por el usuario. Se recuerdan en este navegador; si el
 * almacenamiento no está disponible, simplemente no se recuerdan.
 */
export function useColumnasVisibles<T extends string>(columnas: readonly T[]) {
  const [ocultas, setOcultas] = useState<T[]>([]);

  useEffect(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
      if (Array.isArray(guardadas)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el cliente
        setOcultas(guardadas.filter((c): c is T => columnas.includes(c)));
      }
    } catch {
      /* sin almacenamiento: todas visibles */
    }
  }, [columnas]);

  const alternar = (columna: T) => {
    setOcultas((actuales) => {
      const siguiente = actuales.includes(columna)
        ? actuales.filter((c) => c !== columna)
        : [...actuales, columna];
      try {
        localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      } catch {
        /* no se recuerda, pero se aplica */
      }
      return siguiente;
    });
  };

  return { esVisible: (columna: T) => !ocultas.includes(columna), alternar };
}
