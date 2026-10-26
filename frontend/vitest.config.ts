// Configuración de pruebas separada de vite.config.ts: la configuración de la
// app carga los plugins de TanStack Start/Nitro, que no hacen falta para
// probar lógica pura (datos, utilidades).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
