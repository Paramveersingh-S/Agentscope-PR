from celery import Celery
from app.config import settings
from app.agents.agentscope_init import init_agentscope

# Initialize AgentScope models for the worker process
init_agentscope()

celery_app = Celery(
    "pr_sentinel",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.review_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.workers.review_tasks.process_pr_review": {"queue": "review_queue"}
    }
)
