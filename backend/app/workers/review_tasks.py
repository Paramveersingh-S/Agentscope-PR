import asyncio
import json
from celery.utils.log import get_task_logger
from app.workers.celery_app import celery_app
from app.services.github_service import GitHubService
from app.pipeline.review_pipeline import PRReviewPipeline
from app.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.repository import Repository
from app.models.review_policy import ReviewPolicy
from app.models.pr_review import PRReview
from prometheus_client import Counter, Histogram
import time

logger = get_task_logger(__name__)

PR_REVIEW_COUNT = Counter('pr_review_total', 'Total PR reviews processed', ['status'])
PR_REVIEW_DURATION = Histogram('pr_review_duration_seconds', 'Duration of PR reviews in seconds')

def _run_async(coro):
    # Helper to run async code in Celery worker
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(
    name="app.workers.review_tasks.process_pr_review",
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3},
    retry_backoff=True,
    retry_backoff_max=60
)
def process_pr_review(self, repo_full_name: str, pr_number: int, pr_title: str, installation_id: int):
    logger.info(f"Starting review for {repo_full_name}#{pr_number}")
    start_time = time.time()
    
    try:
        # 0. Check Idempotency
        async def check_existing():
            async with AsyncSessionLocal() as session:
                res = await session.execute(
                    select(PRReview)
                    .join(Repository)
                    .filter(Repository.full_name == repo_full_name, PRReview.pr_number == pr_number, PRReview.status == "completed")
                )
                return res.scalar_one_or_none()
                
        if _run_async(check_existing()):
            logger.info(f"PR Review for {repo_full_name}#{pr_number} already completed. Skipping.")
            return {"status": "skipped", "reason": "already completed"}
            
        # 1. Fetch diff
        github_service = GitHubService(installation_id)
        diff_chunks = github_service.get_pr_diff(repo_full_name, pr_number)
        
        pr_data = {
            "repo_name": repo_full_name,
            "pr_number": pr_number,
            "pr_title": pr_title,
            "diff_chunks": diff_chunks
        }
        
        # 1.5 Fetch Review Policy
        async def fetch_policy():
            async with AsyncSessionLocal() as session:
                repo_res = await session.execute(select(Repository).filter(Repository.full_name == repo_full_name))
                repo = repo_res.scalar_one_or_none()
                if repo:
                    policy_res = await session.execute(select(ReviewPolicy).filter(ReviewPolicy.repository_id == repo.id))
                    policy = policy_res.scalar_one_or_none()
                    if policy:
                        return {
                            "agents_enabled": policy.agents_enabled,
                            "severity_thresholds": policy.severity_thresholds
                        }
            return {"agents_enabled": ["security", "performance", "code_quality", "test_coverage", "documentation", "dependency"]}
            
        policy_dict = _run_async(fetch_policy())
        
        # 2. Run Pipeline
        pipeline = PRReviewPipeline()
        result = _run_async(pipeline.run(pr_data, policy=policy_dict))
        
        # 3. Post Comment
        final_review = result.get("final_review", {})
        comment_body = _format_review_comment(final_review)
        github_service.post_pr_comment(repo_full_name, pr_number, comment_body)
        
        # 4. Save to DB and Deduplicate
        async def store_review_findings():
            async with AsyncSessionLocal() as session:
                from app.services.finding_service import FindingService
                svc = FindingService(session)
                
                repo_res = await session.execute(select(Repository).filter(Repository.full_name == repo_full_name))
                repo = repo_res.scalar_one_or_none()
                if not repo:
                    # Upsert repo if it doesn't exist
                    repo = Repository(
                        full_name=repo_full_name,
                        display_name=repo_full_name.split("/")[-1],
                        default_branch="main",
                        is_active=True
                    )
                    session.add(repo)
                    await session.flush()
                    
                new_review = PRReview(
                    repository_id=repo.id, 
                    pr_number=pr_number, 
                    pr_title=pr_title, 
                    status="completed",
                    overall_score=final_review.get("overall_score"),
                    recommendation=final_review.get("overall_recommendation"),
                    final_summary=final_review.get("executive_summary")
                )
                session.add(new_review)
                await session.flush()
                
                await svc.store_findings(str(new_review.id), final_review.get("deduplicated_findings", []))
                await session.commit()
                
        _run_async(store_review_findings())
        
        duration = time.time() - start_time
        PR_REVIEW_DURATION.observe(duration)
        PR_REVIEW_COUNT.labels(status='success').inc()
        
        logger.info(f"Successfully processed {repo_full_name}#{pr_number}")
        return {"status": "success", "repo": repo_full_name, "pr": pr_number}
        
    except Exception as e:
        duration = time.time() - start_time
        PR_REVIEW_DURATION.observe(duration)
        PR_REVIEW_COUNT.labels(status='error').inc()
        
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
