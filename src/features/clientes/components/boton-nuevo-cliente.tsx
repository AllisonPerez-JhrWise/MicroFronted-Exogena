"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { IconoMas } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import type { ClienteCreado } from "../schemas/usuario.schema";
import { VentanaNuevoCliente } from "./nuevo/ventana-nuevo-cliente";

// La confirmación desaparece a los pocos segundos (guía Wise · Mensajes).
const DURACION_CONFIRMACION_MS = 5000;

/** Único acceso a la creación de clientes: abre la ventana sobre el listado. */
export function BotonNuevoCliente() {
  const [abierto, setAbierto] = useState(false);
  const [creado, setCreado] = useState<ClienteCreado | null>(null);

  useEffect(() => {
    if (!creado) return;
    const id = setTimeout(() => setCreado(null), DURACION_CONFIRMACION_MS);
    return () => clearTimeout(id);
  }, [creado]);

  return (
    <>
      <Button variant="principal" onClick={() => setAbierto(true)}>
        <IconoMas />
        Nuevo cliente
      </Button>
      {abierto && (
        <VentanaNuevoCliente
          onCerrar={() => setAbierto(false)}
          onCreado={(cliente) => {
            setAbierto(false);
            setCreado(cliente);
          }}
        />
      )}
      {creado && (
        <div className="fixed right-6 bottom-6 z-10 w-[360px] max-w-[calc(100%-32px)]">
          <Mensaje nivel="confirmacion" titulo="Cliente creado">
            <p>Se creó {creado.company.display_name}. Si agregaste usuarios, recibirán su bienvenida.</p>
          </Mensaje>
        </div>
      )}
    </>
  );
}
