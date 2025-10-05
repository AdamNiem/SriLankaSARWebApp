# Inference service (development stub)

This is a minimal FastAPI service that exposes a single endpoint:

POST /predict

Request JSON: { lat: number, lon: number, date: "YYYY-MM-DD" }
Response JSON: { flood_probability: number, confidence?: number, meta?: {...} }

Run locally:

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py

The service listens on port 8000 by default. Configure `INFERENCE_URL` in your Next app to point to it (for example `http://localhost:8000`).
