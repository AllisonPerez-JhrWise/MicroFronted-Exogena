"use client";

import { useId } from "react";
import { Modal } from "@/shared/ui/modal";
import { NuevoClienteFlujo } from "./nuevo-cliente-flujo";

export function VentanaNuevoCliente({ onCerrar }: { onCerrar: () => void }) {
  const tituloId = useId();

  return (
    <Modal tituloId={tituloId} onCerrar={onCerrar}>
      <NuevoClienteFlujo tituloId={tituloId} onCerrar={onCerrar} />
    </Modal>
  );
}
