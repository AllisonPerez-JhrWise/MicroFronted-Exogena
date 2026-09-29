"use client";

import { useId } from "react";
import { Modal } from "@/shared/ui/modal";
import type { ClienteCreado } from "../../schemas/usuario.schema";
import { NuevoClienteFlujo } from "./nuevo-cliente-flujo";

interface VentanaNuevoClienteProps {
  onCerrar: () => void;
  onCreado: (cliente: ClienteCreado) => void;
}

export function VentanaNuevoCliente({ onCerrar, onCreado }: VentanaNuevoClienteProps) {
  const tituloId = useId();

  return (
    <Modal tituloId={tituloId} onCerrar={onCerrar}>
      <NuevoClienteFlujo tituloId={tituloId} onCerrar={onCerrar} onCreado={onCreado} />
    </Modal>
  );
}
