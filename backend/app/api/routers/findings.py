from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models.finding import Finding
from app.services.embedding_service import EmbeddingService

router = APIRouter(prefix="/api/v1/findings", tags=["Findings"])
embedding_svc = EmbeddingService()

@router.get("/")
async def list_findings(severity: str = None, agent: str = None, repo: str = None):
    return {"data": [], "total": 0}

@router.get("/{finding_id}")
async def get_finding(finding_id: str):
    return {"id": finding_id}

@router.put("/{finding_id}/feedback")
async def update_finding_feedback(finding_id: str, payload: Dict[str, str], db: AsyncSession = Depends(get_db)):
    action = payload.get("action")
    if action not in ["accepted", "rejected", "noted"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    result = await db.execute(select(Finding).filter(Finding.id == finding_id))
    finding = result.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    finding.user_feedback = action
    if action == "rejected":
        finding.is_false_positive = True
        
    await db.commit()
    return {"status": "updated", "id": finding_id, "action": action}

@router.get("/similar/{finding_id}")
async def get_similar_findings(finding_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Finding).filter(Finding.id == finding_id))
    finding = result.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    text_to_search = f"{finding.title} {finding.description or ''}"
    similar = embedding_svc.find_similar(text_to_search, limit=5)
    
    # Filter out the finding itself
    filtered = [s for s in similar if str(s["id"]) != str(finding_id)]
    return filtered

@router.get("/patterns")
async def get_finding_patterns():
    return []
