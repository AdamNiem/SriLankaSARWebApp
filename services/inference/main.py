from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, confloat, constr
from typing import Optional
import uvicorn

app = FastAPI(title="Flood Inference Service")


class PredictRequest(BaseModel):
    lat: confloat(ge=-90, le=90)
    lon: confloat(ge=-180, le=180)
    date: constr(regex=r"^\d{4}-\d{2}-\d{2}$")  # ISO date YYYY-MM-DD


class PredictResponse(BaseModel):
    flood_probability: float
    confidence: Optional[float]
    meta: Optional[dict]


def compute_prob(lat: float, lon: float, date: str) -> float:
    # deterministic pseudo-random based on inputs (same algorithm as in TS)
    seed = f"{lat}:{lon}:{date}"
    hash = 2166136261
    for ch in seed:
        hash ^= ord(ch)
        hash = (hash * 16777619) & 0xFFFFFFFF
    p = (hash % 10000) / 10000.0
    return round(p * 100, 2)


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    try:
        prob = compute_prob(req.lat, req.lon, req.date)
        confidence = round(abs(prob - 50) / 50, 2)
        return PredictResponse(flood_probability=prob, confidence=confidence, meta={"model": "fastapi-dev-stub"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
