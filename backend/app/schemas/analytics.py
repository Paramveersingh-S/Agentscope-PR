from pydantic import BaseModel
from typing import Dict

class RepositoryAnalytics(BaseModel):
    total_reviews: int
    average_score: float
    critical_findings_count: int
    total_tokens_used: int
    findings_by_category: Dict[str, int]
