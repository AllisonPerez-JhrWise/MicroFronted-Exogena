# MFE Exógena

Microfrontend de Información Exógena construido con Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query y Zod.

## Arranque

```bash
pnpm install
cp .env.example .env.local   # ajustar la URL del microservicio
pnpm dev                     # http://localhost:3001/exogena
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | Ruta bajo la que se monta el MFE (Multi-Zones). Debe coincidir con el rewrite del host. |
| `NEXT_PUBLIC_API_BASE_URL` | URL base del microservicio de clientes (back_exogena), p. ej. `http://localhost:8000/api/v1`. |
| `NEXT_PUBLIC_RUT_API_BASE_URL` | URL base de la API del RUT (lectura y validación del PDF). |
| `NEXT_PUBLIC_RUT_VALIDACION` | `false` para no llamar a la API del RUT y usar datos de ejemplo mientras no exista. |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Timeout por petición (ms). |

Las variables `NEXT_PUBLIC_*` se incrustan en build time: cambiar de ambiente requiere recompilar.

## Arquitectura

```
src/
├── app/                    # Rutas (App Router), layout, providers, error boundary
├── config/env.ts           # Variables de entorno validadas con Zod
├── lib/
│   ├── http/               # Cliente HTTP único hacia el microservicio + ApiError
│   └── query/              # Configuración de TanStack Query
├── shared/components/      # Componentes transversales (sin lógica de negocio)
└── features/
    └── exogena/            # Un feature = un dominio
        ├── api/            # Servicios: únicos que conocen las rutas del microservicio
        ├── schemas/        # Contratos Zod + tipos inferidos
        ├── hooks/          # Hooks de React Query (query keys, cache)
        ├── components/     # UI del feature
        └── index.ts        # API pública del feature
```

**Flujo de datos:** `componente → hook (React Query) → service → apiRequest → microservicio`.
Toda respuesta se valida contra su esquema Zod; si el microservicio cambia el contrato, el error aparece
como `ApiError` de tipo `validation` en lugar de romper la UI con datos inesperados.

**Reglas:**
- Los componentes no llaman a `fetch` ni a los services directamente; usan hooks.
- Fuera de un feature solo se importa desde su `index.ts`.
- Cabeceras comunes (p. ej. token entregado por el host) se registran una vez con `setHeadersProvider`.

## Integración como microfrontend (Multi-Zones)

La app se sirve bajo `basePath` y el host la monta con un rewrite:

```ts
// next.config.ts del host
async rewrites() {
  return [
    { source: "/exogena", destination: `${process.env.EXOGENA_URL}/exogena` },
    { source: "/exogena/:path*", destination: `${process.env.EXOGENA_URL}/exogena/:path*` },
  ];
}
```

La navegación entre zonas distintas debe hacerse con `<a>` (no `<Link>`), ya que cada zona es una app separada.

## Conexión con el microservicio

El navegador llama al microservicio directamente, por lo que este debe habilitar **CORS** para el origen
del frontend (y del host). Si más adelante se requiere ocultar la URL interna o manejar tokens del lado
servidor, basta con cambiar `NEXT_PUBLIC_API_BASE_URL` por un Route Handler de Next (BFF) sin tocar los features.

## Scripts

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Desarrollo en el puerto 3001 |
| `pnpm build` / `pnpm start` | Build de producción (`output: standalone`) |
| `pnpm lint` | ESLint |
| `pnpm type-check` | Chequeo de tipos |
