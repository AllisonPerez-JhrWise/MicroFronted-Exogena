# Parámetros de diseño · Wise

Esto es lo que necesitas para montar cualquier pantalla de Wise sin tener que medir sobre el mockup. Todos los valores están en la hoja de tokens ([src/styles/wise-tokens.css](../src/styles/wise-tokens.css)). Si un valor no está ahí, no debería aparecer escrito en una pantalla. Los mockups aprobados son la referencia de contenido; este documento es la de forma.

> Si una pantalla necesita algo que no está en este documento, dilo antes de inventarlo: probablemente ya exista con otro nombre.

## 1 · Estructura de la pantalla

| Pieza | Medida | Detalle |
| --- | --- | --- |
| Barra lateral | 244 px | Fija. Contraída: 62 px, con iconos de 40×40 centrados y el nombre en `title`. |
| Barra superior | 52 px | Ruta a la izquierda, búsqueda, organización, notificaciones. Fondo blanco, borde inferior 1 px. |
| Año gravable | contextual | Solo aparece cuando la pantalla trabaja sobre un año concreto: dentro de un compromiso o en la campaña de un servicio. En Inicio, Clientes, Compromisos, Documentos y Administración no va. |
| Contenido | máx. 1240 px | Relleno 24 px arriba y abajo, 28 px a los lados. |
| Tarjeta | radio 10 px | Fondo blanco, borde 1 px `--wi-borde`, relleno 16–20 px. Sin sombra. |
| Separación entre bloques | 16 px | 24 px entre secciones distintas de la misma pantalla. |
| Punto de quiebre | 1100 px | Debajo, las dos columnas del contenido pasan a una y la barra arranca contraída. |

El orden de una pantalla es siempre: **ruta → título que nombra el objeto («Exógena 2026») → contexto o indicadores → contenido**. Sin números de paso en los títulos: la posición ya la dice la barra.

## 2 · Color

Un solo color de marca. Los demás son funcionales y cada uno tiene un trabajo: si un color aparece donde no le toca, el usuario lee mal la pantalla.

**Marca · solo tres usos:** logo `#5C141B`, pantalla `#8D0C18`, fondo activo `#F6ECED`, línea `#E8CDD0`. Los tres usos son: el logo, la entrada activa del menú y el borde de 2 px de la fila bajo el cursor. Nada más.

**Datos · escala índigo, de lo hecho a lo que falta:** `#2E3080` → `#4A4CB0` → `#7376C6` → `#9497D4`, riel `#E4E5F6`.

**Estados:** pide acción `#8F5400` · riesgo `#B1291B` · confirmación `#1E7546` · neutro `#4A5159`.

El verde aparece en dos casos: la confirmación después de una acción («Cambios guardados») y el interruptor encendido. Nunca como estado permanente de una fila: «Entregado» y «Cerrado» van en gris, porque ya no piden nada.

## 3 · Tipografía

Instrument Sans, de Google Fonts. Pesos 400, 500, 600 y 700. Un solo tipo en toda la plataforma.

| Uso | Tamaño | Peso | Nota |
| --- | --- | --- | --- |
| Título de pantalla | 20 px | 600 | `letter-spacing: -.01em` |
| Título de sección o tarjeta | 13 px | 600 | — |
| Texto corriente | 13 px | 400 | Interlínea 1,55 |
| Menú lateral | 12,5 px | 500 | Los subelementos en 400 |
| Tabla | 12 px | 400 | Encabezado 11,5 px / 500 |
| Apoyo y leyendas | 11,5 px | 400 | Color `--wi-secundario` |
| Antetítulo | 10,5 px | 600 | Versalitas, `letter-spacing: .08em` |

La negrita marca jerarquía, no énfasis. Dentro de una tabla, ninguna celda va en negrita: si algo hay que destacar, es una columna, no una palabra.

## 4 · Espacio, forma y movimiento

| Concepto | Valor | Dónde |
| --- | --- | --- |
| Escala de espacio | 4 · 6 · 8 · 12 · 16 · 24 · 32 · 40 | No uses valores fuera de esta lista. |
| Radio de control | 6 px | Botones, campos, selectores |
| Radio de navegación | 8 px | Entradas del menú |
| Radio de tarjeta | 10 px | Tarjetas, paneles, modales |
| Píldora | 20 px | Estados y filtros |
| Borde | 1 px | Siempre 1 px. El de 2 px solo marca lo activo, y en vinotinto. |
| Sombra | ninguna | Solo en lo que flota: modal, menú desplegable y tooltip. |
| Transición | 150 ms ease | Color y fondo. Nada de animaciones de entrada. |

## 5 · Barra lateral

Grupos de ejemplo: Inicio · Operación (Clientes, Compromisos, Exógena, Saldos a favor) · Documentos.

| Elemento | Valor |
| --- | --- |
| Alto mínimo de fila | 31 px |
| Relleno | 5 px 9 px |
| Separación icono–texto | 8 px |
| Icono | 14 px |
| Texto | 12,5 px / 500 |
| Subelemento | 12,5 px / 400, sangría 31 px |
| Etiqueta de grupo | 11 px / 500, color tenue |
| Activo | fondo `#F6ECED`, texto `#8D0C18`, borde interno 2 px |
| Bajo el cursor | fondo `#F4F6F8` |

La entrada activa no va en negrita: el color y el borde ya la marcan. Contraída, el texto se oculta y el nombre vive en el `title`.

## 6 · Tablas

| Regla | Valor |
| --- | --- |
| Alto de fila | 28 px (la densidad no es una opción del usuario) |
| Relleno de celda | 6 px 10 px |
| Separador | 1 px `--wi-borde-suave`. Sin cebra. |
| Fila bajo el cursor | fondo `--wi-hover` y borde interno de 2 px vinotinto en la primera celda |
| Alineación | texto a la izquierda; cifras, fechas y porcentajes a la derecha, con `font-variant-numeric: tabular-nums` |
| Fechas | «17 may 2027», ancho fijo. Nunca 17/05/2027 ni ISO en pantalla. |
| Un dato por columna | si necesitas dos, son dos columnas o una línea de apoyo bajo el dato principal |
| Encabezado ordenable | flecha a la derecha del título, solo visible en la columna activa |
| Vacío | guion largo «—», nunca celda en blanco ni «N/A» |

## 7 · Botones y campos

| Elemento | Especificación |
| --- | --- |
| Principal | fondo `--wi-tinta`, texto blanco, 12,5 px / 500, relleno 8 px 14 px, radio 6 px. **Una sola por pantalla.** |
| Secundaria | fondo blanco, borde `--wi-borde-fuerte`, texto tinta |
| En texto | subrayada, sin fondo. Para acciones dentro de una fila o tarjeta. |
| Destructiva | texto `--wi-riesgo` sobre blanco, borde del mismo color. Siempre pide confirmación. |
| Campo | 13 px, relleno 7 px 10 px, borde `--wi-borde-fuerte`, radio 6 px, alto 32 px |
| Foco | borde vinotinto y anillo `0 0 0 3px rgba(141,12,24,.28)`. Nunca `outline: none` sin reemplazo. |
| Deshabilitado | opacidad .45 y cursor normal. Si algo está deshabilitado, di por qué al lado. |
| Área de clic | mínimo 32×32 px, aunque el icono sea de 14 px |
| Interruptor | 34×19 px, radio 10 px. Encendido en `--wi-ok`, apagado en gris `#C9CED3`. Es el único control con verde permanente. Si no se puede apagar, va atenuado y con la etiqueta que explique por qué («Obligatorio»). |

## 8 · Filtros rápidos

- Cápsula de 20 px de radio, relleno 5 px 12 px, 12,5 px / 500, borde 1 px.
- El activo lleva fondo `#F6ECED`, borde `#E8CDD0` y texto `#8D0C18`: la misma señal que la barra lateral.
- El conteo va dentro de la cápsula, en 11,5 px y color tenue.
- Si un filtro señala algo que pide atención, el ámbar va solo en el número, en un círculo de 18 px, no en toda la cápsula.
- Nunca fondo negro sólido para el filtro activo: pesa más que la tabla que filtra.

## 9 · Estados

Ejemplos: Sin iniciar · En ejecución · En revisión · Por aprobar · Vencido · Entregado.

- Píldora de 11,5 px, relleno 2 px 9 px, radio 20 px, borde 1 px.
- Gris por defecto. Solo cambian de color los que piden algo: ámbar cuando alguien debe actuar («Por aprobar», «RUT por renovar») y rojo cuando hay riesgo o plazo vencido.
- «Entregado» y «Cerrado» son grises: ya no piden nada.
- El estado nunca se comunica solo con color: la píldora siempre lleva su texto.

## 10 · Mensajes

| Nivel | Color | Cuándo |
| --- | --- | --- |
| Informativo | blanco con borde neutro | Un dato útil. No hay nada que hacer ni nada detenido. |
| Atención | ámbar | Algo requiere una acción, pero el trabajo puede seguir. |
| Bloqueo | rojo | El proceso no avanza hasta resolverlo. |
| Confirmación | verde | Algo terminó bien después de una acción. Desaparece a los pocos segundos. |
| Interruptor encendido | verde | Es el único control que lleva verde de forma permanente: dice que algo está activo. |

- Si hay una acción, el mensaje trae su botón. Un ámbar o un rojo sin botón no le dice al usuario qué hacer.
- Un solo mensaje por pantalla: si hay varios, se muestra el más urgente y los demás se cuentan.
- Siempre icono y texto, nunca solo color.
- El informativo no lleva ámbar. Informar no es alertar.

## 11 · Gráficas y avance

- La escala índigo va del paso oscuro (lo hecho) al claro (lo que falta). Así el avance se lee sin leyenda.
- Barra de avance en tabla: riel de 6 px de alto y 86 px de ancho, radio 3 px, fondo `--wi-dato-riel`, relleno `--wi-dato-2`. Al lado, el dato en texto («1 de 4»): la barra acompaña, no reemplaza.
- Barra apilada de resumen: 9 px de alto, radio 5 px, 2 px de separación entre segmentos.
- Leyenda siempre presente cuando hay dos o más series, con el número al lado del nombre.
- Un solo eje. Dos magnitudes distintas son dos gráficas.
- Nada de degradados, 3D ni tortas. Para partes de un total, barra apilada.

## 12 · Vacíos, carga y errores

- **Vacío:** una línea que diga qué va ahí y, si aplica, el botón para crearlo. Nunca una tabla con encabezados y nada debajo.
- **Carga:** esqueleto gris con la forma del contenido, no un giro. Si tarda más de 5 segundos, dilo con texto.
- **Proceso largo:** no bloquees la pantalla. Va a «Mis procesos», en el menú del usuario, y avisa al terminar.
- **Error:** qué pasó, qué se puede hacer y, si es del sistema, un identificador para soporte. Nunca el error técnico crudo.
- **Confirmación destructiva:** el botón dice el verbo («Cerrar el compromiso»), no «Aceptar».

## 13 · Accesibilidad

- Contraste mínimo 4,5:1 en texto. Todos los pares de la paleta lo cumplen; si inventas un color, valídalo.
- Todo lo que se hace con el ratón se hace con el teclado, y el foco siempre se ve.
- Los iconos solos llevan `aria-label`. Los estados llevan texto, no solo color.
- El orden del DOM es el orden visual.
- `prefers-reduced-motion`: si está activo, sin transiciones.

## 14 · Lo que nunca

- Ningún color de marca nuevo. Vinotinto es el único; si algo debe resaltar, se resuelve con jerarquía, espacio y tipografía.
- El vinotinto no pinta datos ni estados. Solo dice dónde estás.
- Ni verde ni teal para datos: el verde ya significa «cumplido».
- Sin cebra en tablas, sin bordes verticales, sin celdas en negrita.
- Sin números de paso en los títulos y sin repetir en el cuerpo lo que ya dice el encabezado.
- Sin tres tamaños de letra en una misma fila.
- Sin sombras decorativas ni esquinas de más de 10 px, salvo píldoras.

## 15 · Tokens

La hoja está en [src/styles/wise-tokens.css](../src/styles/wise-tokens.css), copiada tal cual (incluye el modo oscuro, activable con `data-tema="oscuro"` en `<html>`). Es la fuente única de verdad: cambiar un valor ahí lo cambia en toda la plataforma.

Las fechas se formatean en el servidor o en una sola función de la interfaz: «17 may 2027», en minúsculas y sin punto.

## Cómo se aplica en este proyecto

- **Tailwind restringido a los tokens** ([globals.css](../src/app/globals.css)): las escalas por defecto de Tailwind están borradas; una clase fuera de la guía (`text-sm`, `bg-red-500`, `rounded-lg`, `shadow`…) no genera CSS.
  - Color: `bg-wi-lienzo`, `text-wi-secundario`, `border-wi-borde`…
  - Espacio: `p-1` … `p-8` = 4 · 6 · 8 · 12 · 16 · 24 · 32 · 40 px.
  - Texto: `text-pantalla`, `text-seccion`, `text-tarjeta`, `text-cuerpo`, `text-nav`, `text-tabla`, `text-apoyo`, `text-antetitulo`.
  - Radio: `rounded-control`, `rounded-nav`, `rounded-tarjeta`, `rounded-pildora`.
  - Quiebre: `amplio:` (≥ 1100 px). Ancho de contenido: `max-w-contenido`.
  - Medidas propias de un componente que la guía fija explícitamente (relleno 7 px 10 px del campo, 28 px laterales del contenido) se escriben con valor arbitrario (`px-[28px]`).
- **Componentes base** en [src/shared/ui/](../src/shared/ui/): `Button`, `Estado`, `Mensaje`; tabla con la clase `.wi-tabla`; `formatFecha` y `VACIO` en [src/shared/lib/format.ts](../src/shared/lib/format.ts).
