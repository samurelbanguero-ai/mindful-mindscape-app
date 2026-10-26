"""
worker.py — Proceso persistente de inferencia para el backend de Node.

Protocolo (una línea JSON por mensaje):
  arranque  -> {"ready": true, "modelo": "..."}   (o {"ready": false, "error": "..."})
  petición  <- {"id": 1, "inputs": [{"stress": 40, "panic_attacks": 20, "depression": 55}, ...]}
  respuesta -> {"id": 1, "results": [...]}         (o {"id": 1, "error": "..."})
"""

import json
import sys

import inference


def send(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def main():
    try:
        inference.load_model()
    except Exception as err:  # modelo ausente o incompatible
        send({"ready": False, "error": str(err)})
        sys.exit(1)

    send({"ready": True, "modelo": inference.MODEL_NAME})

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        request_id = None
        try:
            request = json.loads(line)
            request_id = request.get("id")
            results = inference.predict_many(request.get("inputs", []))
            send({"id": request_id, "results": results})
        except Exception as err:
            send({"id": request_id, "error": str(err)})


if __name__ == "__main__":
    main()
