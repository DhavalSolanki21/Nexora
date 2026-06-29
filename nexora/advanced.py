"""Package-native clustering and simple forecasting helpers."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score, silhouette_score
from sklearn.preprocessing import StandardScaler

from nexora.profiler.dataset_profile import infer_datetime, is_id_like


def run_clustering(
    df: pd.DataFrame,
    *,
    n_clusters: int = 3,
    feature_columns: list[str] | None = None,
    random_state: int = 42,
) -> dict[str, Any]:
    """Cluster usable rows and return metrics, profiles, and preview coordinates."""

    columns = feature_columns or [
        str(column)
        for column in df.columns
        if not is_id_like(df[column]) and df[column].nunique(dropna=True) > 1
    ]
    columns = [column for column in columns if column in df.columns]
    if not columns:
        raise ValueError(
            "At least one usable feature column is required for clustering."
        )
    if len(df) < n_clusters:
        raise ValueError("Number of clusters cannot exceed row count.")

    raw = _feature_frame(df, columns)
    X = StandardScaler().fit_transform(raw)
    model = KMeans(n_clusters=n_clusters, n_init=10, random_state=random_state)
    labels = model.fit_predict(X)
    coords = _coords(X, random_state)
    silhouette = (
        float(silhouette_score(X, labels))
        if n_clusters > 1 and len(set(labels)) > 1
        else 0.0
    )

    labeled = df.copy()
    labeled["cluster"] = labels
    clusters: list[dict[str, Any]] = []
    for cluster_id in range(n_clusters):
        part = labeled[labeled["cluster"] == cluster_id]
        profile: dict[str, Any] = {}
        for column in columns[:8]:
            series = part[column]
            if pd.api.types.is_numeric_dtype(series):
                profile[column] = _safe(series.mean())
            else:
                mode = series.dropna().astype(str).mode()
                profile[column] = str(mode.iloc[0]) if len(mode) else None
        clusters.append(
            {
                "cluster": cluster_id,
                "size": int(len(part)),
                "percentage": round(100 * len(part) / max(len(df), 1), 2),
                "profile": profile,
            }
        )

    preview = df.head(100).copy()
    preview["cluster"] = labels[: len(preview)]
    preview["cluster_x"] = coords[: len(preview), 0]
    preview["cluster_y"] = coords[: len(preview), 1]
    return {
        "kind": "clustering",
        "n_clusters": n_clusters,
        "feature_columns": columns,
        "metrics": {
            "silhouette": round(silhouette, 4),
            "inertia": round(float(model.inertia_), 4),
        },
        "clusters": clusters,
        "preview": _records(preview),
    }


def run_forecast(
    df: pd.DataFrame,
    *,
    date_column: str,
    target_column: str,
    periods: int = 12,
    frequency: str = "M",
) -> dict[str, Any]:
    """Run simple linear trend forecast for dated numeric observations."""

    if date_column not in df.columns or target_column not in df.columns:
        raise ValueError("Date and target columns must exist.")
    series = df[[date_column, target_column]].copy()
    series[date_column] = pd.to_datetime(
        series[date_column], errors="coerce", format="mixed"
    )
    series[target_column] = pd.to_numeric(series[target_column], errors="coerce")
    series = series.dropna().sort_values(date_column)
    if len(series) < 6:
        raise ValueError("At least six dated numeric observations are required.")

    freq = frequency.upper()
    if freq not in {"D", "W", "M"}:
        raise ValueError("frequency must be D, W, or M.")
    # Bypass pd.Grouper/resample due to Python 3.12 C-extension segfaults
    # We group using Python's native datetime.date to avoid Cython period/resample bugs
    from datetime import date, timedelta

    raw_dates = series[date_column].tolist()
    py_dates = []
    for d in raw_dates:
        if hasattr(d, "to_pydatetime"):
            py_dates.append(d.to_pydatetime().date())
        elif hasattr(d, "date"):
            py_dates.append(d.date())
        else:
            py_dates.append(d)

    if freq == "D":
        group_keys = py_dates
    elif freq == "W":
        group_keys = [d - timedelta(days=d.weekday()) for d in py_dates]
    else:  # M
        group_keys = [date(d.year, d.month, 1) for d in py_dates]

    series["_group_key"] = group_keys
    grouped = series.groupby("_group_key")[target_column].mean().dropna()
    grouped.index = pd.to_datetime(grouped.index)
    if len(grouped) < 6:
        raise ValueError("Not enough observations remain after date grouping.")

    t = np.arange(len(grouped)).reshape(-1, 1)
    y = grouped.values.astype(float)
    holdout = max(2, min(6, len(grouped) // 4))
    model = LinearRegression()
    model.fit(t[:-holdout], y[:-holdout])
    pred_test = model.predict(t[-holdout:])
    metrics = {
        "mae": round(float(mean_absolute_error(y[-holdout:], pred_test)), 4),
        "r2": round(float(r2_score(y[-holdout:], pred_test)), 4)
        if holdout >= 2
        else 0.0,
    }
    model.fit(t, y)
    future_t = np.arange(len(grouped), len(grouped) + periods).reshape(-1, 1)
    future_values = model.predict(future_t)

    current = grouped.index[-1]
    offset = {
        "D": pd.DateOffset(days=1),
        "W": pd.DateOffset(weeks=1),
        "M": pd.DateOffset(months=1),
    }[freq]
    forecast = []
    for value in future_values:
        current = current + offset
        forecast.append(
            {"date": current.date().isoformat(), "prediction": _safe(value)}
        )

    return {
        "kind": "forecast",
        "date_column": date_column,
        "target_column": target_column,
        "frequency": freq,
        "periods": periods,
        "metrics": metrics,
        "history": [
            {"date": index.date().isoformat(), "value": _safe(value)}
            for index, value in grouped.tail(120).items()
        ],
        "forecast": forecast,
    }


def _feature_frame(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    work = pd.DataFrame(index=df.index)
    for column in columns:
        if infer_datetime(df[column]):
            parsed = pd.to_datetime(df[column], errors="coerce", format="mixed")
            work[f"{column}__year"] = parsed.dt.year
            work[f"{column}__month"] = parsed.dt.month
            work[f"{column}__day"] = parsed.dt.day
        else:
            work[column] = df[column]
    work = pd.get_dummies(work, dummy_na=True)
    work = work.apply(pd.to_numeric, errors="coerce")
    return work.fillna(work.median(numeric_only=True)).fillna(0)


def _coords(X: np.ndarray, random_state: int) -> np.ndarray:
    if X.shape[1] >= 2:
        return PCA(n_components=2, random_state=random_state).fit_transform(X)
    return np.c_[X[:, 0], np.zeros(len(X))]


def _records(df: pd.DataFrame) -> list[dict[str, Any]]:
    return [
        {str(key): _safe(value) for key, value in row.items()}
        for row in df.replace({np.nan: None}).to_dict(orient="records")
    ]


def _safe(value: Any) -> Any:
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return None if not np.isfinite(value) else round(float(value), 6)
    if isinstance(value, (pd.Timestamp, np.datetime64)):
        return str(value)
    return value
