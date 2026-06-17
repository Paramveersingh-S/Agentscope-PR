from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])

@router.get("/models")
async def get_models():
    return []

@router.put("/models")
async def update_models(payload: Dict[str, Any]):
    return {"status": "updated"}

@router.get("/agents")
async def get_agents():
    return []

@router.put("/agents")
async def update_agents(payload: Dict[str, Any]):
    return {"status": "updated"}

@router.get("/system")
async def get_system_status():
    return {"status": "ok", "version": "1.0.0"}
