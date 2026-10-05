import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas de lógica (sin navegador): esquemas, armado de peticiones, reglas y mensajes.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // src/config/env.ts valida estas variables al importarse: valores fijos de prueba,
    // independientes de .env.local (nunca se usa un token real en las pruebas).
    env: {
      NEXT_PUBLIC_BASE_PATH: "/exogena",
      NEXT_PUBLIC_API_BASE_URL: "http://exogena.test/api/v1",
      NEXT_PUBLIC_EXTRACTION_API_BASE_URL: "http://extraccion.test",
      NEXT_PUBLIC_IDENTITY_API_BASE_URL: "http://identidad.test",
      NEXT_PUBLIC_ORGANIZATION_ID: "800e1819-6cd5-4ce3-a7c4-aab095fe7e93",
      NEXT_PUBLIC_DEV_TOKEN: "",
    },
  },
});
