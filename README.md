# Nexora

**A local predictive analytics platform** that understands datasets, lets users train selected reusable models, executes backend-owned predictions, benchmarks optional model comparisons, and uses local language models for guidance and education.

## Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, Framer Motion, Recharts, Axios, React Router |
| Backend | FastAPI, Uvicorn, Pandas, NumPy |
| ML (planned) | Scikit-learn, XGBoost, LightGBM, CatBoost, PyCaret, SHAP, Prophet |
| AI (planned) | Ollama · Phi-3 Mini |
| Database | Local file store by default · MongoDB Atlas optional |
| Auth | Firebase Auth ready for production token verification |
| Deploy | Netlify frontend · Render FastAPI backend |

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
python run.py
```

API runs at **http://127.0.0.1:8000** — docs at `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at **http://localhost:5173**.

### Try a sample dataset

Upload `sample-data/customer_churn.csv` from the landing page.

## Phase 1 — Foundation ✓

- [x] React + FastAPI foundation
- [x] CSV upload with validation
- [x] Dataset Intelligence Engine (structural + statistical analysis)
- [x] Model readiness report after upload, with eligibility and unsupported-path reasons
- [x] Prediction possibility suggestions
- [x] Dataset health score
- [x] Column profiling & preview
- [x] Futuristic dark UI with glassmorphism

## Phase 2 — Dataset Intelligence & Preprocessing ✓

- [x] Problem type detector (classification, regression, time series)
- [x] Target column configuration with AI suggestions
- [x] Automated preprocessing pipeline (missing values, encoding, scaling, outliers, duplicates)
- [x] Feature selection (auto-exclude ID & datetime columns)
- [x] Deeper insights (correlations, class balance, difficulty score, quality warnings)
- [x] 3-step workflow UI (Intelligence → Target → Pipeline)

## Phase 3 — Prediction Studio, Model Comparison & Learning Chat ✓

- [x] **256+ model registry** (scikit-learn, XGBoost, LightGBM, CatBoost variants)
- [x] **Prediction Studio** — select one to five models, train persisted pipelines, and run reproducible predictions
- [x] Prediction receipts with model output, consensus, assumptions, and input-range warnings
- [x] Automated benchmarking with live WebSocket leaderboard
- [x] Optional Model Comparison Arena UI with champion card, charts, and speed badges
- [x] **Grounded learning chat** — CSV facts and eligibility answer directly from the backend; Ollama is reserved for short educational explanations
- [x] Floating dataset chat widget on every dashboard view

### Ollama setup

```bash
ollama pull phi3:mini
ollama serve
```

Nexora does not ask Ollama to calculate predictions. Prediction Studio trains and runs the selected backend models. Common factual questions such as row counts, missing values, eligible models, and numeric averages are calculated directly from the CSV for speed and accuracy. Open-ended explanations use Ollama with a short timeout configured by `OLLAMA_TIMEOUT` (default: 15 seconds).

Configure via `backend/.env`:
```
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=phi3:mini
```

## Production Setup

Nexora is configured for a split deployment:

- **Frontend:** Netlify builds `frontend` with `npm run build` and publishes `dist`.
- **Backend:** Render runs the FastAPI app from `backend` with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Database:** Set `PERSISTENCE_BACKEND=mongodb` and `MONGODB_URI` to a MongoDB Atlas connection string. Local JSON/CSV storage remains available for development.
- **Auth:** Set `FIREBASE_PROJECT_ID` and `FIREBASE_CREDENTIALS_JSON` when Firebase login is enabled.

Frontend environment:

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

Backend environment:

```
PUBLIC_API_URL=https://api.yourdomain.com
PUBLIC_APP_URL=https://yourdomain.com
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
MONGODB_URI=mongodb+srv://...
```

Suggested domain layout:

| Host | Target |
|------|--------|
| `yourdomain.com` / `www.yourdomain.com` | Netlify site |
| `api.yourdomain.com` | Render web service |

## Roadmap

| Phase | Focus |
|-------|-------|
| 4 | Production persistence, history, experiments, batch prediction, drift |
| 5 | Cloud object storage, richer auth UI, workers, performance optimization |

## Project Structure

```
nexora/
├── backend/          # FastAPI + dataset intelligence
├── frontend/         # React dashboard
├── sample-data/      # Example CSV files
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/status` | Firebase auth integration status |
| GET | `/api/auth/me` | Verify a Firebase bearer token when configured |
| POST | `/api/datasets/upload` | Upload & analyze CSV |
| GET | `/api/datasets/{id}` | Get analysis |
| GET | `/api/datasets/{id}/preview` | Preview rows |
| GET | `/api/datasets/{id}/session` | Pipeline session state |
| POST | `/api/datasets/{id}/configure` | Set target & detect problem type |
| POST | `/api/datasets/{id}/preprocess` | Run preprocessing pipeline |
| GET | `/api/datasets/{id}/processed-preview` | Preview processed data |
| GET | `/api/models/registry` | Model registry stats (256+ models) |
| GET | `/api/datasets/{id}/production/models` | List selectable prediction models |
| POST | `/api/datasets/{id}/production/train` | Train and persist selected models |
| POST | `/api/datasets/{id}/production/predict` | Run saved backend model predictions |
| POST | `/api/datasets/{id}/production/batch-predict` | Upload a CSV and download enriched predictions |
| GET | `/api/datasets/{id}/production/batches` | List batch prediction and drift runs |
| POST | `/api/datasets/{id}/production/explain-prediction` | Explain a single prediction with feature contributions |
| GET/POST | `/api/datasets/{id}/deployments` | Manage stable prediction API endpoints |
| POST | `/predict/{deployment_id}` | Public prediction endpoint secured by `X-Nexora-Key` |
| GET | `/api/datasets` | Dataset history with archive/delete/report status |
| GET | `/api/datasets/{id}/experiments` | Experiment tracking records |
| POST | `/api/datasets/{id}/clustering/run` | Run KMeans clustering |
| POST | `/api/datasets/{id}/time-series/run` | Run simple time-series forecasting |
| POST | `/api/datasets/{id}/training/start` | Start model benchmark |
| GET | `/api/datasets/{id}/training` | Training results |
| WS | `/api/ws/training/{id}` | Live training events |
| POST | `/api/datasets/{id}/chat` | Ollama dataset Q&A |
| GET | `/api/datasets/{id}/chat/status` | Ollama availability |

## License

Open source — built entirely on free software.
