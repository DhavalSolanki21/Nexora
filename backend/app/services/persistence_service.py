"""Optional MongoDB persistence with a local-file fallback.

The existing app is intentionally file-first for local development. These helpers let
production deployments mirror structured records to MongoDB Atlas when configured,
without making MongoDB mandatory for smoke tests or offline demos.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from app.config import settings


@lru_cache(maxsize=1)
def _client():
    if settings.persistence_backend.lower() != "mongodb" or not settings.mongodb_uri:
        return None
    try:
        from pymongo import MongoClient
    except ImportError:
        return None

    client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=2000)
    try:
        client.admin.command("ping")
    except Exception:
        return None
    return client


def collection(name: str):
    client = _client()
    if client is None:
        return None
    return client[settings.mongodb_db][name]


def upsert(collection_name: str, key: dict[str, Any], document: dict[str, Any]) -> None:
    coll = collection(collection_name)
    if coll is None:
        return
    try:
        coll.update_one(key, {"$set": document}, upsert=True)
    except Exception:
        return


def insert(collection_name: str, document: dict[str, Any]) -> None:
    coll = collection(collection_name)
    if coll is None:
        return
    try:
        coll.insert_one(document)
    except Exception:
        return


def find(
    collection_name: str, query: dict[str, Any] | None = None
) -> list[dict[str, Any]]:
    coll = collection(collection_name)
    if coll is None:
        return []
    try:
        out = []
        for doc in coll.find(query or {}):
            doc.pop("_id", None)
            out.append(doc)
        return out
    except Exception:
        return []
