import { FormatosTable } from "@/features/exogena";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Información Exógena</h1>
      <FormatosTable />
    </main>
  );
}
