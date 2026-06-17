from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID

class ReviewPolicyBase(BaseModel):
    name: str
    agents_enabled: List[str] = ["security", "performance", "code_quality", "test_coverage"]
    severity_thresholds: Dict[str, Any] = {"block_on": ["CRITICAL"], "warn_on": ["HIGH"]}
    custom_rules: List[Dict[str, Any]] = []
    max_diff_size_chars: int = 50000
    token_budget: int = 50000

class ReviewPolicyCreate(ReviewPolicyBase):
    pass

class ReviewPolicyResponse(ReviewPolicyBase):
    id: UUID
    repository_id: UUID
    is_default: bool
    model_config = ConfigDict(from_attributes=True)

class RepositoryBase(BaseModel):
    github_repo_id: int
    full_name: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    default_branch: str = "main"
    review_config: Dict[str, Any] = {"auto_review": True, "block_on_critical": True}

class RepositoryCreate(RepositoryBase):
    github_app_installation_id: Optional[int] = None
    webhook_secret: Optional[str] = None

class RepositoryResponse(RepositoryBase):
    id: UUID
    is_active: bool
    model_config = ConfigDict(from_attributes=True)
