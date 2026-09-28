"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { IconoAtras, IconoCerrar } from "@/shared/ui/iconos";
import { IndicadorPasos } from "@/shared/ui/indicador-pasos";
import { ORGANIZACION_VACIA, type Organizacion } from "../../schemas/organizacion.schema";
import type { RutValidado } from "../../schemas/rut.schema";
import { PasoDatosRut } from "./paso-datos-rut";
import { PasoNitRut } from "./paso-nit-rut";

const PASOS = ["NIT y RUT", "Datos del RUT", "Compromisos", "Usuarios del cliente"] as const;

/** Lo diligenciado en todos los pasos; se conserva al ir y volver entre ellos. */
interface DatosNuevoCliente {
  nit: string;
  archivo: File | null;
  rut: RutValidado | null;
  organizacion: Organizacion;
}

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
  const [datos, setDatos] = useState<DatosNuevoCliente>({
    nit: "",
    archivo: null,
    rut: null,
    organizacion: ORGANIZACION_VACIA,
  });

  const guardarOrganizacion = (organizacion: Organizacion, siguientePaso: number) => {
    setDatos((d) => ({ ...d, organizacion }));
    setPaso(siguientePaso);
  };

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

      {paso === 0 && (
        <PasoNitRut
          nitInicial={datos.nit}
          archivoInicial={datos.archivo}
          onCancelar={onCerrar}
          onValidado={({ nit, archivo, rut }) => {
            setDatos((d) => ({ ...d, nit, archivo, rut }));
            setPaso(1);
          }}
        />
      )}

      {paso === 1 && datos.rut && (
        <PasoDatosRut
          rut={datos.rut}
          organizacionInicial={datos.organizacion}
          onAtras={(organizacion) => guardarOrganizacion(organizacion, 0)}
          onSiguiente={(organizacion) => guardarOrganizacion(organizacion, 2)}
        />
      )}

      {paso >= 2 && (
        // Pasos 3 y 4: aún sin contenido.
        <div className="flex flex-col gap-5">
          <p className="text-wi-secundario">El paso «{PASOS[paso]}» todavía no está disponible.</p>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setPaso(paso - 1)}>
              <IconoAtras />
              Atrás
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
