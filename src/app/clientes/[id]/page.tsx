import type { Metadata } from "next";
import { FichaEmpresaVista } from "@/features/clientes";

export const metadata: Metadata = { title: "Ficha de la empresa" };

export default async function FichaEmpresaPage({ params }: PageProps<"/clientes/[id]">) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-contenido px-[28px] py-6">
      <FichaEmpresaVista id={id} />
    </main>
  );
}
