"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { IconoCerrar } from "@/shared/ui/iconos";
import { IndicadorPasos } from "@/shared/ui/indicador-pasos";
import type { RutValidado } from "../../schemas/rut.schema";
import { PasoNitRut } from "./paso-nit-rut";

const PASOS = ["NIT y RUT", "Datos del RUT", "Compromisos", "Usuarios del cliente"] as const;

interface NuevoClienteFlujoProps {
  tituloId: string;
  onCerrar: () => void;
}

/**
 * Flujo de creación de cliente, independiente del contenedor que lo muestra
 * (hoy, la ventana que abre «Nuevo cliente»). El paso en curso vive en memoria:
 * no hay URL para entrar directo a un paso.
 */
export function NuevoClienteFlujo({ tituloId, onCerrar }: NuevoClienteFlujoProps) {
  const [paso, setPaso] = useState(0);
  const [, setRut] = useState<RutValidado | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h2 id={tituloId} className="text-pantalla font-semibold tracking-[-0.01em] text-wi-tinta">
            Nuevo cliente
          </h2>
          <IndicadorPasos pasos={PASOS} actual={paso} />
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onCerrar}
          className="flex size-7 shrink-0 items-center justify-center rounded-control text-wi-secundario hover:bg-wi-hover"
        >
          <IconoCerrar />
        </button>
      </header>

      {paso === 0 ? (
        <PasoNitRut
          onCancelar={onCerrar}
          onValidado={(rut) => {
            setRut(rut);
            setPaso(1);
          }}
        />
      ) : (
        // Pasos 2 a 4: aún sin contenido.
        <div className="flex flex-col gap-5">
          <p className="text-wi-secundario">El paso «{PASOS[paso]}» todavía no está disponible.</p>
          <div className="flex justify-end">
            <Button onClick={onCerrar}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
