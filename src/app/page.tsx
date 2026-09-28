import { FormatosTable } from "@/features/exogena";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-contenido px-[28px] py-6">
      <h1 className="mb-6 text-pantalla font-semibold tracking-[-0.01em] text-wi-tinta">Formatos de Exógena</h1>
      <FormatosTable />
    </main>
  );
}
