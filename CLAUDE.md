@AGENTS.md

# Diseño de interfaz

Toda pantalla sigue los **Parámetros de diseño · Wise**: [docs/diseno-wise.md](docs/diseno-wise.md). Léelos antes de crear o modificar UI.

- Solo valores de [src/styles/wise-tokens.css](src/styles/wise-tokens.css) (vía las clases de Tailwind restringidas en `globals.css`). Si falta un valor, pregunta antes de inventarlo.
- Reutiliza `src/shared/ui` (`Button`, `Estado`, `Mensaje`), la clase `.wi-tabla` y `formatFecha` / `VACIO`.
- Vinotinto solo para: entrada activa del menú y borde de la fila bajo el cursor. Verde solo para confirmaciones tras una acción e interruptores encendidos.
- Una sola acción principal por pantalla. Carga con esqueleto, vacío con una línea (y botón de crear si aplica), errores con qué pasó, qué hacer e identificador de soporte.
