# SinagCalc PH

Residential rooftop solar calculator for Filipino homeowners.
Enter your location, roof size, electricity bill, and system preference to get a personalized estimate for system size, cost, ROI, and environmental impact.

---

## Stack

| Layer     | Tech |
|-----------|------|
| Backend   | Python, FastAPI, Pydantic v2 |
| Frontend  | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Container | Docker, Docker Compose |
| Deploy    | Render (backend), Vercel (frontend) |

---

## Project Structure

```text
SinagCalc/
|-- docker-compose.yml           # Full stack local development
|-- .env.example                 # Environment template
|
|-- backend/
|   |-- Dockerfile
|   |-- app.py                   # FastAPI entry point
|   |-- config.py                # App settings and constants
|   |-- pytest.ini
|   |-- requirements.txt
|   |-- api/
|   |   |-- __init__.py
|   |   |-- schemas.py           # Request and response models
|   |   \-- routes/
|   |       |-- __init__.py
|   |       |-- calculator.py    # POST /calculate
|   |       |-- explainer.py     # Explanation endpoints
|   |       \-- options.py       # GET /options
|   |-- calculator/
|   |   |-- __init__.py
|   |   |-- environment.py       # Environmental impact logic
|   |   |-- explainer.py         # Savings and system explanation logic
|   |   |-- financials.py        # Cost, ROI, and payback logic
|   |   \-- system.py            # System sizing logic
|   \-- tests/
|       |-- test_calculator_api.py
|       |-- test_environment.py
|       |-- test_financials.py
|       \-- test_system.py
|
\-- frontend/
    |-- Dockerfile
    |-- next-env.d.ts
    |-- next.config.js
    |-- package.json
    |-- postcss.config.js
    |-- tailwind.config.ts
    |-- tsconfig.json
    \-- src/
        |-- app/
        |   |-- globals.css
        |   |-- layout.tsx
        |   \-- page.tsx         # Main app page
        |-- components/
        |   |-- RateEditor.tsx
        |   |-- results/
        |   |   |-- EnvironmentCard.tsx
        |   |   |-- ExplainerCard.tsx
        |   |   |-- FinancialsCard.tsx
        |   |   |-- ResultsDashboard.tsx
        |   |   \-- SystemCard.tsx
        |   \-- steps/
        |       |-- BillStep.tsx
        |       |-- LocationStep.tsx
        |       |-- QualityStep.tsx
        |       |-- RoofStep.tsx
        |       \-- SystemTypeStep.tsx
        |-- hooks/
        |   |-- useCalculator.ts
        |   \-- useExplainer.ts
        \-- lib/
            |-- api.ts
            \-- types.ts
```

---

## Local Development

### Option A - Docker Compose

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### Option B - Without Docker

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

### Backend -> Render

1. Push to GitHub.
2. Create a new Web Service on Render and set the root directory to `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Set env var: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Frontend -> Vercel

1. Import the repo in Vercel and set the root directory to `frontend`.
2. Set env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. Deploy.

---

## API

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/` | Service info |
| GET    | `/options` | All input options and distributor rates |
| POST   | `/calculate` | Run a solar calculation |
| GET    | `/docs` | Swagger UI |
| GET    | `/redoc` | ReDoc |

### POST /calculate request body

```json
{
  "zone": "ncr",
  "roof_area": "medium",
  "monthly_bill": "2000_to_3500",
  "quality_tier": "standard",
  "electricity_rate_php": 12.0
}
```

`electricity_rate_php` is user-supplied. The frontend pre-fills it from the selected distributor's default, but the user can edit it freely. The backend stays fully stateless.

---

## Key Design Decisions

**User-configurable rates**: `electricity_rate_php` travels with the request. Distributors and their defaults live in `config.py`, so no database is needed.

**Stateless backend**: Every request contains everything needed to produce the result, which keeps the API simple and safe to scale.

**Mirrored types**: `frontend/src/lib/types.ts` mirrors the Pydantic models in `backend/api/schemas.py`, making frontend contract changes easier to catch.

**Framework-light calculator logic**: `system.py`, `financials.py`, `environment.py`, and `explainer.py` keep the core business logic separate from FastAPI routes.
