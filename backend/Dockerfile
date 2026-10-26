FROM node:20-bookworm

# Entorno Python para el modelo de ML (fuera de /app porque docker-compose monta ./backend encima)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3-venv \
  && rm -rf /var/lib/apt/lists/*
COPY ml/requirements.txt /tmp/ml-requirements.txt
RUN python3 -m venv /opt/ml-venv \
  && /opt/ml-venv/bin/pip install --no-cache-dir -r /tmp/ml-requirements.txt
ENV ML_PYTHON=/opt/ml-venv/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
