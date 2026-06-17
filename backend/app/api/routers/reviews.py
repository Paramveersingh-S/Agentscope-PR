from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.pr_review import PRReview
from app.models.finding import Finding
from app.models.repository import Repository

router = APIRouter(prefix="/api/v1/reviews", tags=["Reviews"])

@router.get("")
async def list_reviews(page: int = 1, status: str = None, repo: str = None, risk: str = None, db: AsyncSession = Depends(get_db)):
    limit = 20
    offset = (page - 1) * limit
    
    query = select(PRReview).options(selectinload(PRReview.repository)).order_by(PRReview.created_at.desc())
    if status:
        query = query.filter(PRReview.status == status)
        
    res = await db.execute(query.offset(offset).limit(limit))
    reviews = res.scalars().all()
    
    return {"data": reviews, "page": page}

@router.post("/trigger")
async def trigger_review(payload: Dict[str, Any]):
    return {"status": "queued", "id": "dummy_id"}

@router.get("/{review_id}")
async def get_review(review_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(PRReview).options(selectinload(PRReview.repository)).filter(PRReview.id == review_id)
    )
    review = res.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.get("/{review_id}/findings")
async def get_review_findings(review_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Finding).filter(Finding.pr_review_id == review_id))
    return res.scalars().all()

@router.get("/{review_id}/agents")
async def get_review_agents(review_id: str):
    return []

@router.post("/{review_id}/retry")
async def retry_review(review_id: str):
    return {"status": "retrying"}

@router.delete("/{review_id}")
async def delete_review(review_id: str):
    return {"status": "deleted"}

@router.websocket("/{review_id}/stream")
async def review_stream(websocket: WebSocket, review_id: str):
    await websocket.accept()
    try:
        while True:
            # Placeholder for actual websocket logic
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print(f"Client disconnected from review {review_id}")
