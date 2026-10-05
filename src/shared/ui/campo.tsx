import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";

const CONTROL =
  "h-7 w-full rounded-control border border-wi-borde-fuerte bg-wi-superficie text-cuerpo text-wi-tinta transition-colors duration-150 disabled:opacity-45";

/** Campo de texto Wise: 13 px, relleno 7 px 10 px, alto 32 px, radio 6 px. */
export function Campo({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} px-[10px] py-[7px] placeholder:text-wi-tenue ${className}`} {...props} />;
}

/** Selector con la misma forma que el campo de texto. */
export function Selector({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${CONTROL} px-2 ${className}`} {...props} />;
}

export function Etiqueta({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`mb-1 block text-apoyo font-medium text-wi-secundario ${className}`} {...props} />;
}

/** Casilla de verificación con su texto; toda la fila es clicable (≥ 32 px de alto). */
export function Casilla({
  etiqueta,
  nota,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { etiqueta: string; nota?: string }) {
  return (
    <label className="flex min-h-7 items-center gap-3 rounded-control px-2 text-cuerpo text-wi-texto hover:bg-wi-hover has-disabled:hover:bg-transparent">
      <input type="checkbox" className="size-4 accent-wi-tinta disabled:opacity-45" {...props} />
      <span className="flex-1">{etiqueta}</span>
      {nota && <span className="text-apoyo text-wi-tenue">{nota}</span>}
    </label>
  );
}
