# finding_service.py
# Finding storage + embedding

from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

class FindingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def store_findings(self, review_id: str, findings: List[Dict[str, Any]]):
        # Placeholder
        pass
