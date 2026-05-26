from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.dataset_store import load_analysis
from app.services.ollama_service import chat_with_dataset, check_ollama_status

router = APIRouter(prefix="/api/datasets", tags=["chat"])


@router.get("/{dataset_id}/chat/status")
async def chat_status(dataset_id: str):
    if not load_analysis(dataset_id):
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return await check_ollama_status()


@router.post("/{dataset_id}/chat", response_model=ChatResponse)
async def dataset_chat(dataset_id: str, body: ChatRequest):
    if not load_analysis(dataset_id):
        raise HTTPException(status_code=404, detail="Dataset not found.")

    history = [{"role": m.role, "content": m.content} for m in body.history]
    result = await chat_with_dataset(dataset_id, body.message, history)
    return ChatResponse(**result)
