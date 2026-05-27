from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ClusteringRequest,
    ClusteringResult,
    TimeSeriesRequest,
    TimeSeriesResult,
)
from app.services.advanced_modeling_service import (
    load_clustering,
    load_time_series,
    run_clustering,
    run_time_series,
)

router = APIRouter(prefix="/api/datasets", tags=["advanced-modeling"])


@router.post("/{dataset_id}/clustering/run", response_model=ClusteringResult)
async def start_clustering(dataset_id: str, body: ClusteringRequest):
    try:
        return run_clustering(dataset_id, body.n_clusters, body.feature_columns)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{dataset_id}/clustering", response_model=ClusteringResult | None)
async def get_clustering(dataset_id: str):
    return load_clustering(dataset_id)


@router.post("/{dataset_id}/time-series/run", response_model=TimeSeriesResult)
async def start_time_series(dataset_id: str, body: TimeSeriesRequest):
    try:
        return run_time_series(
            dataset_id,
            body.date_column,
            body.target_column,
            body.periods,
            body.frequency,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{dataset_id}/time-series", response_model=TimeSeriesResult | None)
async def get_time_series(dataset_id: str):
    return load_time_series(dataset_id)
