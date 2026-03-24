"""
app.py
──────
FastAPI application entry point. Creates the app, registers routers,
configures CORS from environment variables.

Run locally:  uvicorn app:app --reload
Production:   uvicorn app:app --host 0.0.0.0 --port $PORT
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from api.routes.options    import router as options_router
from api.routes.calculator import router as calculator_router

app = FastAPI(
    title="SinagCalc",
    description=(
        "Rooftop solar calculator API for Filipino homeowners. "
        "Estimates system size, cost, ROI, payback, and environmental impact."
    ),
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list(),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(options_router)
app.include_router(calculator_router)


@app.get("/", tags=["Meta"], summary="Service info")
def root():
    return {
        "service": "SinagCalc API",
        "version": "1.0.0",
        "docs":    "/docs",
    }


# ── Dev runner ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🌞  sinagCalc  —  http://localhost:8000")
    print("📄  Swagger UI     —  http://localhost:8000/docs\n")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
