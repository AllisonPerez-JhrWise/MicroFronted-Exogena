"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 text-sm text-zinc-500">No pudimos cargar esta sección.</p>
      <button type="button" onClick={reset} className="mt-4 text-sm font-medium underline">
        Reintentar
      </button>
    </main>
  );
}
