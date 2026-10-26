"""
predict.py — Predicción de ansiedad desde la línea de comandos
Mindful Mindscape · Modelo: Random Forest Regressor v1.0.0

El backend usa worker.py (proceso persistente); este script sirve para
probar el modelo de forma aislada.

Uso:
  python3 predict.py <stress> <panic_attacks> <depression>
  python3 predict.py 45 60 70
"""

import json
import sys

import inference

if len(sys.argv) != 4:
    print(json.dumps({"error": "Se requieren 3 argumentos: stress panic_attacks depression"}))
    sys.exit(1)

try:
    inference.load_model()
except FileNotFoundError:
    print(json.dumps({"error": f"Modelo no encontrado en {inference.MODEL_PATH}"}))
    sys.exit(1)

try:
    resultado = inference.predict_many([dict(zip(inference.FEATURES, sys.argv[1:]))])[0]
except ValueError as err:
    print(json.dumps({"error": str(err)}, ensure_ascii=False))
    sys.exit(1)

print(json.dumps(resultado, ensure_ascii=False))
