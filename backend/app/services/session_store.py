import json
from pathlib import Path

import pandas as pd

from app.config import settings
from app.models.schemas import DatasetSession, PreprocessResult


def _session_path(dataset_id: str) -> Path:
    return settings.upload_dir / f"{dataset_id}.session.json"


def _processed_path(dataset_id: str) -> Path:
    return settings.upload_dir / f"{dataset_id}.processed.csv"


def load_session(dataset_id: str) -> DatasetSession | None:
    path = _session_path(dataset_id)
    if not path.exists():
        return None
    return DatasetSession.model_validate_json(path.read_text(encoding="utf-8"))


def save_session(session: DatasetSession) -> None:
    _session_path(session.dataset_id).write_text(
        session.model_dump_json(indent=2), encoding="utf-8"
    )


def save_processed_df(dataset_id: str, df: pd.DataFrame) -> None:
    df.to_csv(_processed_path(dataset_id), index=False)


def load_processed_df(dataset_id: str) -> pd.DataFrame | None:
    path = _processed_path(dataset_id)
    if not path.exists():
        return None
    return pd.read_csv(path, low_memory=False)


def update_session_preprocess(dataset_id: str, result: PreprocessResult) -> DatasetSession:
    session = load_session(dataset_id)
    if not session:
        raise ValueError("Session not found. Configure target first.")

    session.preprocess_result = result
    session.status = "preprocessed"
    save_session(session)
    return session
