import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "principal" | "secundaria" | "texto" | "destructiva";

// Principal: una sola por pantalla. Destructiva: siempre con confirmación y el verbo en el texto.
const variants: Record<ButtonVariant, string> = {
  principal: "bg-wi-tinta text-white border border-wi-tinta",
  secundaria: "bg-wi-superficie text-wi-tinta border border-wi-borde-fuerte hover:bg-wi-hover",
  texto: "text-wi-tinta underline underline-offset-2",
  destructiva: "bg-wi-superficie text-wi-riesgo border border-wi-riesgo hover:bg-wi-riesgo-fondo",
};

export function Button({
  variant = "secundaria",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const box = variant === "texto" ? "min-h-7 px-1" : "min-h-7 px-[14px] py-3 rounded-control";
  return (
    <button
      type={type}
      className={`${box} inline-flex items-center justify-center gap-2 text-nav font-medium leading-none transition-colors duration-150 disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
