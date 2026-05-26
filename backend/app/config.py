from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Nexora API"
    debug: bool = True
    upload_dir: Path = Path("uploads")
    max_upload_mb: int = 100
    max_rows_preview: int = 50
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Ollama
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "phi3:mini"
    ollama_timeout: float = 15.0
    ollama_max_tokens: int = 256

    # Training
    train_test_split: float = 0.2
    cv_folds: int = 3
    model_timeout_sec: int = 45
    max_parallel_models: int = 1
    random_seed: int = 42

    # Persistence / auth integrations. Local files remain the development fallback.
    persistence_backend: str = "local"
    mongodb_uri: str | None = None
    mongodb_db: str = "nexora"
    firebase_project_id: str | None = None
    firebase_credentials_json: str | None = None
    object_storage_backend: str = "local"
    object_storage_bucket: str | None = None
    public_app_url: str = "http://localhost:5173"
    public_api_url: str = "http://127.0.0.1:8000"

    class Config:
        env_file = ".env"


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
