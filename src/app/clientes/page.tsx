import { Suspense } from "react";
import type { Metadata } from "next";
import { BotonNuevoCliente, ClientesVista } from "@/features/clientes";
import { EncabezadoPantalla } from "@/shared/components/encabezado-pantalla";
import { SkeletonFilas } from "@/shared/components/query-state";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientesPage() {
  return (
    <main className="mx-auto w-full max-w-contenido px-[28px] py-6">
      <EncabezadoPantalla titulo="Clientes" acciones={<BotonNuevoCliente />} />
      {/* Los filtros se leen de la URL, que solo existe en el navegador. */}
      <Suspense fallback={<SkeletonFilas />}>
        <ClientesVista />
      </Suspense>
    </main>
  );
}
