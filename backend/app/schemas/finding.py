from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class FindingBase(BaseModel):
    agent_name: str
    finding_id_label: Optional[str] = None
    category: str
    severity: str
    title: str
    description: Optional[str] = None
    recommendation: Optional[str] = None
    file_path: Optional[str] = None
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    code_snippet: Optional[str] = None
    reference: Optional[str] = None
    owasp_category: Optional[str] = None

class FindingCreate(FindingBase):
    pass

class FindingResponse(FindingBase):
    id: UUID
    review_id: UUID
    agent_run_id: Optional[UUID] = None
    is_duplicate: bool = False
    duplicate_of: Optional[UUID] = None
    user_feedback: Optional[str] = None
    is_false_positive: bool = False
    model_config = ConfigDict(from_attributes=True)
