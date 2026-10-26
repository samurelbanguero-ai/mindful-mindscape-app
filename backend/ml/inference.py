"""
inference.py — Lógica compartida de inferencia del modelo de ansiedad.

La usan `predict.py` (CLI) y `worker.py` (proceso persistente que consume el
backend de Node). Carga el Random Forest una sola vez por proceso.
"""

import os

import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "modelo_rf.joblib")

FEATURES = ["stress", "panic_attacks", "depression"]
MODEL_NAME = "RandomForestRegressor v1.0.0"

_modelo = None


def load_model():
    global _modelo
    if _modelo is None:
        _modelo = joblib.load(MODEL_PATH)
    return _modelo


def _risk_level(ansiedad):
    if ansiedad < 40:
        return "bajo", "Nivel de ansiedad dentro del rango esperado."
    if ansiedad < 60:
        return "moderado", "Nivel de ansiedad moderado. Se recomienda atención preventiva."
    if ansiedad < 75:
        return "alto", "Nivel de ansiedad elevado. Se recomienda apoyo emocional activo."
    return "severo", "Nivel de ansiedad severo. Se recomienda consulta con un profesional."


def validate(values):
    """Valida un dict con las 3 variables (0–100). Lanza ValueError si no es válido."""
    clean = {}
    for name in FEATURES:
        if name not in values:
            raise ValueError(f"Falta la variable '{name}'")
        try:
            value = float(values[name])
        except (TypeError, ValueError):
            raise ValueError(f"'{name}' debe ser numérico")
        if not (0 <= value <= 100):
            raise ValueError(f"'{name}' debe estar entre 0 y 100, recibido: {value}")
        clean[name] = value
    return clean


def predict_many(inputs):
    """Predice para una lista de dicts {stress, panic_attacks, depression}."""
    modelo = load_model()
    clean = [validate(v) for v in inputs]
    if not clean:
        return []

    frame = pd.DataFrame(clean, columns=FEATURES)
    predicciones = modelo.predict(frame)
    importancias = dict(zip(FEATURES, [round(float(v), 4) for v in modelo.feature_importances_]))

    resultados = []
    for factores, valor in zip(clean, predicciones):
        ansiedad = max(0.0, min(100.0, float(valor)))  # clip al rango válido
        nivel, descripcion = _risk_level(ansiedad)
        resultados.append({
            "ansiedad_predicha": round(ansiedad, 2),
            "nivel_riesgo": nivel,
            "descripcion": descripcion,
            "factores": factores,
            "importancia_variables": importancias,
            "modelo": MODEL_NAME,
        })
    return resultados
