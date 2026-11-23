// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { fileURLToPath } from "node:url";
import { searchForWorkspaceRoot } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// El backend siempre es alcanzable en esta URL desde el proceso de Vite
// (dentro del contenedor: red de Docker; en local: localhost).
const backendTarget = (process.env.VITE_API_URL || "http://localhost:3000/api").replace(
  /\/api\/?$/,
  "",
);

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  // Build de producción: servidor Node en .output/server/index.mjs (el reenvío de /api
  // al backend lo hace src/server.ts, que además fija la IP real del cliente)
  nitro: {
    preset: "node-server",
  },

  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      // El catálogo de emociones vive en shared/ (raíz del repo, montado en /shared en Docker)
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          fileURLToPath(new URL("../shared", import.meta.url)),
        ],
      },
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          // Reenvía la IP real del navegador (X-Forwarded-For) para auditoría y límites
          xfwd: true,
        },
      },
    },
  },
});
