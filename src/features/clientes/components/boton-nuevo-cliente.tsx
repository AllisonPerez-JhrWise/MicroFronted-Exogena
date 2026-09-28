"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { IconoMas } from "@/shared/ui/iconos";
import { VentanaNuevoCliente } from "./nuevo/ventana-nuevo-cliente";

/** Único acceso a la creación de clientes: abre la ventana sobre el listado. */
export function BotonNuevoCliente() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button variant="principal" onClick={() => setAbierto(true)}>
        <IconoMas />
        Nuevo cliente
      </Button>
      {abierto && <VentanaNuevoCliente onCerrar={() => setAbierto(false)} />}
    </>
  );
}
