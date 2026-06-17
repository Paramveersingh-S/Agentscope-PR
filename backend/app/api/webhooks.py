import hmac
import hashlib
import json
from fastapi import APIRouter, Request, Header, HTTPException
from app.config import settings
from app.workers.review_tasks import process_pr_review

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

async def verify_github_signature(request: Request, x_hub_signature_256: str):
    if not settings.GITHUB_WEBHOOK_SECRET:
        return
    
    payload_body = await request.body()
    signature = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    
    expected_signature = f"sha256={signature}"
    if not hmac.compare_digest(expected_signature, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid GitHub signature")

@router.post("/github")
async def github_webhook(
    request: Request,
    x_github_event: str = Header(None),
    x_hub_signature_256: str = Header(None)
):
    await verify_github_signature(request, x_hub_signature_256)
    
    payload = await request.json()
    
    if x_github_event == "pull_request":
        action = payload.get("action")
        # Only process opened or synchronize (new commits) events
        if action in ["opened", "synchronize"]:
            pr = payload.get("pull_request", {})
            repo = payload.get("repository", {})
            installation = payload.get("installation", {})
            
            repo_full_name = repo.get("full_name")
            pr_number = pr.get("number")
            pr_title = pr.get("title")
            installation_id = installation.get("id")
            
            if repo_full_name and pr_number:
                # Enqueue Celery task
                process_pr_review.delay(
                    repo_full_name=repo_full_name,
                    pr_number=pr_number,
                    pr_title=pr_title,
                    installation_id=installation_id
                )
                return {"status": "accepted", "message": "PR review queued"}
                
    return {"status": "ignored", "message": "Event not handled"}

@router.post("/gitlab")
async def gitlab_webhook(request: Request):
    return {"status": "not_implemented"}

@router.get("/health")
async def webhook_health():
    return {"status": "healthy"}
