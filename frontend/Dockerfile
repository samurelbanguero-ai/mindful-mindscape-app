# Imagen de producción del frontend. Contexto de build: raíz del repositorio
# (necesita shared/emotions.json, que comparte con el backend).

# 1. Compilar la app (SSR + estáticos) a .output
FROM node:20-bookworm AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY shared /shared
COPY frontend/ ./
ARG VITE_API_URL=http://backend:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# 2. Servidor Node mínimo: solo el resultado del build, sin código fuente ni dependencias de desarrollo
FROM node:20-bookworm AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
ENV NODE_ENV=production \
    PORT=3000 \
    BACKEND_URL=http://backend:3000
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
