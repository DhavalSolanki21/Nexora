from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import settings
from app.models.schemas import ExperimentRecord
from app.services.persistence_service import insert


def _path(dataset_id: str) -> Path:
    return settings.upload_dir / f"{dataset_id}.experiments.json"


def list_experiments(dataset_id: str) -> list[ExperimentRecord]:
    path = _path(dataset_id)
    if not path.exists():
        return []
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    return [ExperimentRecord(**item) for item in raw]


def save_experiment(record: ExperimentRecord) -> ExperimentRecord:
    records = list_experiments(record.dataset_id)
    records.append(record)
    _path(record.dataset_id).write_text(
        json.dumps([item.model_dump() for item in records], indent=2),
        encoding="utf-8",
    )
    insert("experiments", record.model_dump())
    return record


def create_experiment(
    dataset_id: str,
    kind: str,
    problem_type: str,
    target_column: str | None = None,
    config: dict[str, Any] | None = None,
    metrics: dict[str, Any] | None = None,
    models: list[dict[str, Any]] | None = None,
    best_model: dict[str, Any] | None = None,
    artifact_refs: dict[str, str] | None = None,
) -> ExperimentRecord:
    record = ExperimentRecord(
        run_id=str(uuid.uuid4()),
        dataset_id=dataset_id,
        kind=kind,  # type: ignore[arg-type]
        created_at=datetime.now(timezone.utc).isoformat(),
        problem_type=problem_type,
        target_column=target_column,
        config=config or {},
        metrics=metrics or {},
        models=models or [],
        best_model=best_model,
        artifact_refs=artifact_refs or {},
    )
    return save_experiment(record)


def compare_experiments(dataset_id: str) -> dict[str, Any]:
    records = list_experiments(dataset_id)
    metric_names = sorted(
        {
            metric
            for record in records
            for metric in (record.best_model or {}).get("metrics", {}).keys()
        }
        | {metric for record in records for metric in record.metrics.keys()}
    )
    rows: list[dict[str, Any]] = []
    for record in records:
        best_metrics = (record.best_model or {}).get("metrics", {})
        row = {
            "run_id": record.run_id,
            "kind": record.kind,
            "created_at": record.created_at,
            "problem_type": record.problem_type,
            "target_column": record.target_column,
            "best_model": (record.best_model or {}).get("model_name"),
        }
        for metric in metric_names:
            row[metric] = best_metrics.get(metric, record.metrics.get(metric))
        rows.append(row)
    return {"dataset_id": dataset_id, "metric_names": metric_names, "rows": rows}

