from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta

from app.api.deps import get_db
from app.models.pr_review import PRReview
from app.models.finding import Finding

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    # Total reviews
    res_total = await db.execute(select(func.count(PRReview.id)))
    total_reviews = res_total.scalar_one()
    
    # Average score
    res_score = await db.execute(select(func.avg(PRReview.overall_score)))
    avg_score = res_score.scalar_one() or 0.0
    
    # Critical findings blocked
    res_critical = await db.execute(
        select(func.count(Finding.id))
        .filter(Finding.severity == "CRITICAL")
    )
    critical_blocked = res_critical.scalar_one()
    
    return {
        "total_reviews": total_reviews,
        "avg_score": round(avg_score, 1),
        "critical_blocked": critical_blocked
    }

@router.get("/trends")
async def get_analytics_trends(days: int = 7, db: AsyncSession = Depends(get_db)):
    # Return last 7 days of average score
    cutoff = datetime.utcnow() - timedelta(days=days)
    res = await db.execute(
        select(func.date(PRReview.created_at).label("date"), func.avg(PRReview.overall_score).label("score"))
        .filter(PRReview.created_at >= cutoff)
        .group_by(func.date(PRReview.created_at))
        .order_by(func.date(PRReview.created_at))
    )
    
    trends = [{"name": str(row.date), "score": round(row.score, 1)} for row in res.all()]
    return trends

@router.get("/top-issues")
async def get_top_issues():
    return []

@router.get("/agent-performance")
async def get_agent_performance(db: AsyncSession = Depends(get_db)):
    from app.models.pr_review import AgentRun
    
    res = await db.execute(
        select(
            AgentRun.agent_name,
            func.count(AgentRun.id).label("runs"),
            func.sum(AgentRun.prompt_tokens).label("prompt_tokens"),
            func.sum(AgentRun.completion_tokens).label("completion_tokens"),
            func.avg(AgentRun.latency_ms).label("avg_latency")
        )
        .group_by(AgentRun.agent_name)
    )
    
    performance = []
    for row in res.all():
        performance.append({
            "agent_name": row.agent_name,
            "runs": row.runs,
            "total_tokens": (row.prompt_tokens or 0) + (row.completion_tokens or 0),
            "avg_latency": round(row.avg_latency or 0, 0)
        })
        
    return performance

@router.get("/risk-distribution")
async def get_risk_distribution():
    return {}

@router.get("/repositories")
async def get_repo_stats():
    return []
