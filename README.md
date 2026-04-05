# ☀️ SinagCalc PH

Residential rooftop solar calculator for Filipino homeowners.
Enter your location, roof size, electricity bill, and system preference —
get a personalised estimate for system size, cost, ROI, and environmental impact.

---

## Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Backend   | Python · FastAPI · Pydantic v2    |
| Frontend  | Next.js 14 · React 18 · TypeScript · Tailwind CSS |
| Container | Docker · Docker Compose           |
| Deploy    | Vercel (backend) · Vercel (frontend) |

---

## Project Structure

```
solarsense-ph/
├── docker-compose.yml      ← full stack local dev
├── .env.example            ← copy to .env and fill in
│
├── backend/
│   ├── Dockerfile          ← multi-stage (dev / prod)
│   ├── app.py              ← FastAPI entry point
│   ├── config.py           ← all PH constants + pydantic Settings
│   ├── requirements.txt
│   ├── api/
│   │   ├── schemas.py      ← Pydantic request + response models
│   │   └── routes/
│   │       ├── options.py  ← GET /options
│   │       └── calculator.py ← POST /calculate
│   └── calculator/
│       ├── system.py       ← sizing logic
│       ├── financials.py   ← cost, ROI, cash flow
│       └── environment.py  ← CO₂, trees, car km
│
└── frontend/
    ├── Dockerfile          ← multi-stage (dev / builder / prod)
    ├── next.config.js
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx    ← main page, wires everything
        │   └── globals.css
        ├── components/
        │   ├── RateEditor.tsx        ← distributor picker + rate input
        │   ├── steps/                ← one component per input step
        │   └── results/              ← result dashboard + detail cards
        ├── hooks/
        │   └── useCalculator.ts      ← all API state in one place
        └── lib/
            ├── api.ts                ← typed fetch wrapper
            └── types.ts              ← mirrors Pydantic models exactly
```

---

## Local Development

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### Option B — Without Docker

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

### Backend → Render

1. Push to GitHub
2. New Web Service on render.com → connect repo → set Root Directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Set env var: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Frontend → Vercel

1. Import repo on vercel.com → set Root Directory to `frontend`
2. Set env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. Deploy — Vercel detects Next.js automatically

---

## API

| Method | Path         | Description                       |
|--------|--------------|-----------------------------------|
| GET    | `/`          | Service info                      |
| GET    | `/options`   | All input options + distributor rates |
| POST   | `/calculate` | Run a solar calculation           |
| GET    | `/docs`      | Swagger UI (interactive)          |
| GET    | `/redoc`     | ReDoc                             |

### POST /calculate — request body

```json
{
  "zone":                 "ncr",
  "roof_area":            "medium",
  "monthly_bill":         "2000_to_3500",
  "quality_tier":         "standard",
  "electricity_rate_php": 12.0
}
```

`electricity_rate_php` is user-supplied. The frontend pre-fills it from
the selected distributor's default but the user can edit it freely.
The backend stays fully stateless.

---

## Key Design Decisions

**User-configurable rates** — `electricity_rate_php` travels with the
request. Distributors and their defaults live in `config.py`. No database
needed; no stale cached rates.

**Stateless backend** — every request contains everything needed to
produce the result. Safe to run multiple workers.

**Mirrored types** — `frontend/src/lib/types.ts` mirrors every Pydantic
model in `backend/api/schemas.py`. When you change a response shape,
TypeScript tells you everywhere the frontend needs updating.

**calculator/ has zero framework imports** — `system.py`, `financials.py`,
and `environment.py` are pure Python. Swap FastAPI for anything else
and not a line of business logic changes.
