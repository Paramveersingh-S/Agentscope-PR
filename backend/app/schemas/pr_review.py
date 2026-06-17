from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.schemas.finding import FindingResponse

class AgentRunBase(BaseModel):
    agent_name: str
    model_used: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    status: str = "pending"
    error_message: Optional[str] = None

class AgentRunResponse(AgentRunBase):
    id: UUID
    review_id: UUID
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PRReviewBase(BaseModel):
    pr_number: int
    pr_title: Optional[str] = None
    pr_body: Optional[str] = None
    pr_author: Optional[str] = None
    pr_url: Optional[str] = None
    base_branch: Optional[str] = None
    head_branch: Optional[str] = None
    head_sha: Optional[str] = None
    status: str = "pending"
    overall_score: Optional[float] = None
    risk_level: Optional[str] = None
    recommendation: Optional[str] = None
    block_merge: bool = False
    error_message: Optional[str] = None

class PRReviewResponse(PRReviewBase):
    id: UUID
    repository_id: UUID
    diff_stats: Optional[Dict[str, Any]] = None
    orchestration_plan: Optional[Dict[str, Any]] = None
    final_summary: Optional[str] = None
    github_review_id: Optional[int] = None
    token_usage: Optional[Dict[str, Any]] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    agent_runs: List[AgentRunResponse] = []
    findings: List[FindingResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
