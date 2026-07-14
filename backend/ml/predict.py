"""
predict.py — Microservicio de predicción de ansiedad
Mindful Mindscape · Modelo: Random Forest Regressor v1.0.0

Uso desde Node.js:
  const { execFile } = require('child_process');
  execFile('python3', ['predict.py', '45', '60', '70'], (err, stdout) => {
    const result = JSON.parse(stdout);
  });

Uso standalone:
  python3 predict.py <stress> <panic_attacks> <depression>
  python3 predict.py 45 60 70
"""

import sys
import json
import os
import joblib
import pandas as pd

# ── Rutas ──────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'modelo_rf.joblib')

# ── Cargar modelo ──────────────────────────────────────────────────────────
try:
    modelo = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(json.dumps({"error": f"Modelo no encontrado en {MODEL_PATH}"}))
    sys.exit(1)

# ── Leer argumentos ────────────────────────────────────────────────────────
if len(sys.argv) != 4:
    print(json.dumps({"error": "Se requieren 3 argumentos: stress panic_attacks depression"}))
    sys.exit(1)

try:
    stress        = float(sys.argv[1])
    panic_attacks = float(sys.argv[2])
    depression    = float(sys.argv[3])
except ValueError:
    print(json.dumps({"error": "Los argumentos deben ser numéricos"}))
    sys.exit(1)

# ── Validar rango (escala Google Trends 0–100) ─────────────────────────────
for nombre, valor in [("stress", stress), ("panic_attacks", panic_attacks), ("depression", depression)]:
    if not (0 <= valor <= 100):
        print(json.dumps({"error": f"'{nombre}' debe estar entre 0 y 100, recibido: {valor}"}))
        sys.exit(1)

# ── Predicción ─────────────────────────────────────────────────────────────
entrada = pd.DataFrame([{
    "stress": stress,
    "panic_attacks": panic_attacks,
    "depression": depression
}])

ansiedad = float(modelo.predict(entrada)[0])
ansiedad = max(0.0, min(100.0, ansiedad))  # clip al rango válido

# ── Nivel de riesgo ────────────────────────────────────────────────────────
if ansiedad < 40:
    nivel = "bajo"
    descripcion = "Nivel de ansiedad dentro del rango esperado."
elif ansiedad < 60:
    nivel = "moderado"
    descripcion = "Nivel de ansiedad moderado. Se recomienda atención preventiva."
elif ansiedad < 75:
    nivel = "alto"
    descripcion = "Nivel de ansiedad elevado. Se recomienda apoyo emocional activo."
else:
    nivel = "severo"
    descripcion = "Nivel de ansiedad severo. Se recomienda consulta con un profesional."

# ── Importancia de factores ────────────────────────────────────────────────
importancias = dict(zip(
    ["stress", "panic_attacks", "depression"],
    [round(float(v), 4) for v in modelo.feature_importances_]
))

# ── Respuesta JSON ─────────────────────────────────────────────────────────
resultado = {
    "ansiedad_predicha": round(ansiedad, 2),
    "nivel_riesgo": nivel,
    "descripcion": descripcion,
    "factores": {
        "stress": stress,
        "panic_attacks": panic_attacks,
        "depression": depression
    },
    "importancia_variables": importancias,
    "modelo": "RandomForestRegressor v1.0.0"
}

print(json.dumps(resultado, ensure_ascii=False))
