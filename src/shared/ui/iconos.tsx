import type { SVGProps } from "react";

// Iconos de 14 px con trazo del color del texto. Decorativos: quien los use solo,
// sin texto al lado, debe dar aria-label al control que los contiene.
function Icono(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export function IconoMas(props: SVGProps<SVGSVGElement>) {
  return (
    <Icono {...props}>
      <path d="M7 2.5v9M2.5 7h9" />
    </Icono>
  );
}

export function IconoCerrar(props: SVGProps<SVGSVGElement>) {
  return (
    <Icono {...props}>
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </Icono>
  );
}

export function IconoSubir(props: SVGProps<SVGSVGElement>) {
  return (
    <Icono {...props}>
      <path d="M7 9V2.5M4.5 5L7 2.5 9.5 5M2.5 9v2.5h9V9" />
    </Icono>
  );
}

export function IconoAtras(props: SVGProps<SVGSVGElement>) {
  return (
    <Icono {...props}>
      <path d="M11.5 7h-9M6 3.5L2.5 7 6 10.5" />
    </Icono>
  );
}

export function IconoCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <Icono {...props}>
      <path d="M3 7.2l2.6 2.6L11 4.4" />
    </Icono>
  );
}
