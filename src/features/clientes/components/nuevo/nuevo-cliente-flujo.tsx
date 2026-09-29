"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { IconoAtras, IconoCerrar } from "@/shared/ui/iconos";
import { IndicadorPasos } from "@/shared/ui/indicador-pasos";
import type { Compromiso } from "../../schemas/compromiso.schema";
import { ORGANIZACION_VACIA, type Organizacion } from "../../schemas/organizacion.schema";
import { nombreDelRut, type RutValidado } from "../../schemas/rut.schema";
import { PasoCompromisos } from "./paso-compromisos";
import { PasoDatosRut } from "./paso-datos-rut";
import { PasoNitRut } from "./paso-nit-rut";

const PASOS = ["NIT y RUT", "Datos del RUT", "Compromisos", "Usuarios del cliente"] as const;

/** Lo diligenciado en todos los pasos; se conserva al ir y volver entre ellos. */
interface DatosNuevoCliente {
  nit: string;
  archivo: File | null;
  rut: RutValidado | null;
  organizacion: Organizacion;
  compromisos: Compromiso[];
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
    compromisos: [],
  });

  /** Guarda lo diligenciado en un paso y pasa a otro. */
  const irA = (siguientePaso: number, cambios: Partial<DatosNuevoCliente> = {}) => {
    setDatos((d) => ({ ...d, ...cambios }));
    setPaso(siguientePaso);
  };

  // Desde «Compromisos», el título nombra al cliente (como en el mockup).
  const titulo = paso >= 2 && datos.rut ? `Nuevo cliente · ${nombreDelRut(datos.rut)}` : "Nuevo cliente";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h2 id={tituloId} className="text-pantalla font-semibold tracking-[-0.01em] text-wi-tinta">
            {titulo}
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
          onValidado={({ nit, archivo, rut }) => irA(1, { nit, archivo, rut })}
        />
      )}

      {paso === 1 && datos.rut && (
        <PasoDatosRut
          rut={datos.rut}
          organizacionInicial={datos.organizacion}
          onAtras={(organizacion) => irA(0, { organizacion })}
          onSiguiente={(organizacion) => irA(2, { organizacion })}
        />
      )}

      {paso === 2 && (
        <PasoCompromisos
          compromisosIniciales={datos.compromisos}
          onAtras={(compromisos) => irA(1, { compromisos })}
          onOmitir={() => irA(3, { compromisos: [] })}
          onSiguiente={(compromisos) => irA(3, { compromisos })}
        />
      )}

      {paso >= 3 && (
        // Paso 4: aún sin contenido.
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
