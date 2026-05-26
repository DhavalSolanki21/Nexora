from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import advanced, auth, chat, datasets, explainability, pipeline, training

app = FastAPI(
    title=settings.app_name,
    description="Autonomous AI-powered predictive analytics platform",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router)
app.include_router(auth.router)
app.include_router(pipeline.router)
app.include_router(training.router)
app.include_router(training.public_router)
app.include_router(chat.router)
app.include_router(explainability.router)
app.include_router(advanced.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "nexora-api", "version": "0.4.0"}
