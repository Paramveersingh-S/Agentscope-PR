# finding_service.py
# Finding storage + embedding

from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.finding import Finding
from app.services.embedding_service import EmbeddingService

class FindingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.embedding_svc = EmbeddingService()
        
    async def store_findings(self, review_id: str, findings: List[Dict[str, Any]]):
        for f in findings:
            text = f.get("title", "") + " " + f.get("description", "")
            embedding = self.embedding_svc.generate_embedding(text)
            
            similar = self.embedding_svc.find_similar(
                text, limit=1, min_similarity=0.88, where={"review_id": review_id}
            )
            
            duplicate_of = None
            if similar:
                duplicate_of = similar[0]["id"]
                
            new_finding = Finding(
                review_id=review_id,
                title=f.get("title"),
                description=f.get("description"),
                severity=f.get("severity", "INFO"),
                category=f.get("category", "GENERAL"),
                file_path=f.get("file_path"),
                line_start=f.get("line_start"),
                line_end=f.get("line_end"),
                code_snippet=f.get("code_snippet"),
                agent_name=f.get("agent", "system"),
                embedding=embedding,
                duplicate_of=duplicate_of
            )
            self.db.add(new_finding)
            await self.db.flush()
            
            self.embedding_svc.add_finding(
                finding_id=str(new_finding.id),
                text=text,
                metadata={"review_id": review_id}
            )
