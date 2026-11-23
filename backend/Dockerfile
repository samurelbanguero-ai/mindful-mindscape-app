# Imagen de producción del backend. Contexto de build: raíz del repositorio
# (necesita shared/emotions.json, que comparte con el frontend).
FROM node:20-bookworm

# Entorno Python para el modelo de ML
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3-venv \
  && rm -rf /var/lib/apt/lists/*
COPY backend/ml/requirements.txt /tmp/ml-requirements.txt
RUN python3 -m venv /opt/ml-venv \
  && /opt/ml-venv/bin/pip install --no-cache-dir -r /tmp/ml-requirements.txt
ENV ML_PYTHON=/opt/ml-venv/bin/python

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY shared /shared
COPY backend/ ./

ENV NODE_ENV=production \
    DATA_DIR=/data \
    PYTHONDONTWRITEBYTECODE=1

# Sin privilegios de root; /data es el volumen de la base de datos y los logs
RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "index.js"]
