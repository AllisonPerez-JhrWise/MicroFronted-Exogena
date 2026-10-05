"use client";

import { useState } from "react";
import { IconoCerrar } from "@/shared/ui/iconos";
import { IndicadorPasos } from "@/shared/ui/indicador-pasos";
import type { Compromiso } from "../../schemas/compromiso.schema";
import type { SeleccionGrupo } from "../../schemas/grupo.schema";
import { ORGANIZACION_VACIA, type Organizacion } from "../../schemas/organizacion.schema";
import { nombreDelRut, type Rut } from "../../schemas/rut.schema";
import type { ClienteCreado } from "../../schemas/usuario.schema";
import { PasoCompromisos } from "./paso-compromisos";
import { PasoDatosRut } from "./paso-datos-rut";
import { PasoNitRut } from "./paso-nit-rut";
import { PasoUsuarios, type DatosPasoUsuarios } from "./paso-usuarios";

const PASOS = ["NIT y RUT", "Datos del RUT", "Compromisos", "Usuarios del cliente"] as const;

// Ancho del contenido por paso: compromisos y usuarios tienen tablas con más columnas.
const ANCHO_PASO = ["w-[672px]", "w-[672px]", "w-[812px]", "w-[812px]"] as const;

/** Lo diligenciado en todos los pasos; se conserva al ir y volver entre ellos. */
interface DatosNuevoCliente {
  nit: string;
  archivo: File | null;
  rut: Rut | null;
  organizacion: Organizacion;
  /** Grupo del catálogo o nuevo; null = sin grupo. */
  grupo: SeleccionGrupo | null;
  compromisos: Compromiso[];
  usuarios: DatosPasoUsuarios;
}

interface NuevoClienteFlujoProps {
  tituloId: string;
  onCerrar: () => void;
  onCreado: (cliente: ClienteCreado) => void;
}

/**
 * Flujo de creación de cliente, independiente del contenedor que lo muestra
 * (hoy, la ventana que abre «Nuevo cliente»). El paso en curso vive en memoria:
 * no hay URL para entrar directo a un paso.
 */
export function NuevoClienteFlujo({ tituloId, onCerrar, onCreado }: NuevoClienteFlujoProps) {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<DatosNuevoCliente>({
    nit: "",
    archivo: null,
    rut: null,
    organizacion: ORGANIZACION_VACIA,
    grupo: null,
    compromisos: [],
    usuarios: { incluirContacto: true, cargoContacto: "", usuarios: [] },
  });

  /** Guarda lo diligenciado en un paso y pasa a otro. */
  const irA = (siguientePaso: number, cambios: Partial<DatosNuevoCliente> = {}) => {
    setDatos((d) => ({ ...d, ...cambios }));
    setPaso(siguientePaso);
  };

  // Desde «Compromisos», el título nombra al cliente (como en el mockup).
  const titulo = paso >= 2 && datos.rut ? `Nuevo cliente · ${nombreDelRut(datos.rut)}` : "Nuevo cliente";

  return (
    <div className={`flex max-w-full flex-col gap-5 ${ANCHO_PASO[paso]}`}>
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
          grupoInicial={datos.grupo}
          onAtras={(cambios) => irA(0, cambios)}
          onSiguiente={(cambios) => irA(2, cambios)}
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

      {paso === 3 && datos.rut && (
        <PasoUsuarios
          rut={datos.rut}
          organizacion={datos.organizacion}
          grupo={datos.grupo}
          compromisos={datos.compromisos}
          datosIniciales={datos.usuarios}
          onIrAPaso={(paso, usuarios) => irA(paso, { usuarios })}
          onCambiarGrupo={(grupo) => setDatos((d) => ({ ...d, grupo }))}
          onCreado={onCreado}
        />
      )}
    </div>
  );
}
