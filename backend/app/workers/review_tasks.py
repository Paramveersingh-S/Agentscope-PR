import asyncio
import json
from celery.utils.log import get_task_logger
from app.workers.celery_app import celery_app
from app.services.github import GitHubService
from app.pipeline.review_pipeline import PRReviewPipeline
from app.database import AsyncSessionLocal

logger = get_task_logger(__name__)

def _run_async(coro):
    # Helper to run async code in Celery worker
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(name="app.workers.review_tasks.process_pr_review")
def process_pr_review(repo_full_name: str, pr_number: int, pr_title: str, installation_id: int):
    logger.info(f"Starting review for {repo_full_name}#{pr_number}")
    
    try:
        # 1. Fetch diff
        github_service = GitHubService(installation_id)
        diff_text = github_service.get_pr_diff(repo_full_name, pr_number)
        
        pr_data = {
            "repo_name": repo_full_name,
            "pr_number": pr_number,
            "pr_title": pr_title,
            "diff": diff_text
        }
        
        # 2. Run Pipeline
        pipeline = PRReviewPipeline()
        result = _run_async(pipeline.run(pr_data))
        
        # 3. Post Comment
        final_review = result.get("final_review", {})
        comment_body = _format_review_comment(final_review)
        github_service.post_pr_comment(repo_full_name, pr_number, comment_body)
        
        logger.info(f"Successfully processed {repo_full_name}#{pr_number}")
        return {"status": "success", "repo": repo_full_name, "pr": pr_number}
        
    except Exception as e:
        logger.error(f"Error processing PR {repo_full_name}#{pr_number}: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}

def _format_review_comment(review_json: dict) -> str:
    """Convert the Aggregator JSON to a beautiful Markdown comment."""
    score = review_json.get("overall_score", 0)
    recommendation = review_json.get("overall_recommendation", "NEEDS_DISCUSSION")
    summary = review_json.get("executive_summary", "")
    
    body = f"## 🛡️ PR Sentinel Review\n\n"
    body += f"**Score:** {score}/10 | **Recommendation:** {recommendation}\n\n"
    body += f"### Executive Summary\n{summary}\n\n"
    
    must_fix = review_json.get("must_fix", [])
    if must_fix:
        body += "### 🚨 Must Fix\n"
        for item in must_fix:
            body += f"- {item}\n"
            
    dedup = review_json.get("deduplicated_findings", [])
    if dedup:
        body += "\n### 📋 Key Findings\n"
        for f in dedup:
            title = f.get("title", "Unknown")
            agent = f.get("agent", "System")
            body += f"- **[{agent.upper()}]** {title}\n"
            
    return body
