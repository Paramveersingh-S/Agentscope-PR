from pydantic import BaseModel
from typing import Optional, Any, Dict

class GitHubRepository(BaseModel):
    id: int
    full_name: str
    name: str

class GitHubPullRequest(BaseModel):
    number: int
    title: str
    body: Optional[str] = None
    state: str
    html_url: str
    base: Dict[str, Any]
    head: Dict[str, Any]
    user: Dict[str, Any]

class GitHubWebhookPayload(BaseModel):
    action: str
    number: Optional[int] = None
    pull_request: Optional[GitHubPullRequest] = None
    repository: GitHubRepository
    installation: Optional[Dict[str, Any]] = None
