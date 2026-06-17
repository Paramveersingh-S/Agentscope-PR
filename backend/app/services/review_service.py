# review_service.py
# Review CRUD + orchestration trigger

from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_reviews(self) -> List[Dict[str, Any]]:
        # Placeholder for DB query
        return []
        
    async def create_review(self, pr_data: Dict[str, Any]) -> Dict[str, Any]:
        # Placeholder for DB insert
        return {"id": "dummy_id"}
