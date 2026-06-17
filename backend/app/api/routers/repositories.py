from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.api.deps import get_db
from app.models.repository import Repository
from app.models.pr_review import PRReview
from app.services.github_service import GitHubService

router = APIRouter(prefix="/api/v1/repositories", tags=["Repositories"])

@router.get("")
async def list_repositories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository).order_by(Repository.updated_at.desc()))
    repos = result.scalars().all()
    return repos

@router.post("/sync")
async def sync_repositories(db: AsyncSession = Depends(get_db)):
    """Fetches all repositories from the GitHub App installation and syncs them to the DB."""
    try:
        svc = GitHubService()
        github_repos = svc.fetch_all_installation_repositories()
        
        synced_count = 0
        for r_data in github_repos:
            # Check if repo exists
            res = await db.execute(select(Repository).filter(Repository.github_repo_id == r_data["github_repo_id"]))
            existing = res.scalar_one_or_none()
            
            if existing:
                existing.full_name = r_data["full_name"]
                existing.display_name = r_data["display_name"]
                existing.description = r_data["description"]
                existing.default_branch = r_data["default_branch"]
                existing.github_app_installation_id = r_data["installation_id"]
            else:
                new_repo = Repository(
                    github_repo_id=r_data["github_repo_id"],
                    full_name=r_data["full_name"],
                    display_name=r_data["display_name"],
                    description=r_data["description"],
                    default_branch=r_data["default_branch"],
                    github_app_installation_id=r_data["installation_id"],
                    is_active=True
                )
                db.add(new_repo)
            synced_count += 1
            
        await db.commit()
        return {"status": "success", "synced_count": synced_count}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}")
async def get_repository(repo_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Repository).filter(Repository.id == repo_id))
    repo = res.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo

@router.put("/{repo_id}")
async def update_repository(repo_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Repository).filter(Repository.id == repo_id))
    repo = res.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    if "is_active" in payload:
        repo.is_active = payload["is_active"]
        
    await db.commit()
    return repo

@router.delete("/{repo_id}")
async def disconnect_repository(repo_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Repository).filter(Repository.id == repo_id))
    repo = res.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    await db.delete(repo)
    await db.commit()
    return {"status": "disconnected"}

@router.get("/{repo_id}/reviews")
async def get_repository_reviews(repo_id: str, page: int = 1, db: AsyncSession = Depends(get_db)):
    limit = 20
    offset = (page - 1) * limit
    res = await db.execute(
        select(PRReview)
        .filter(PRReview.repository_id == repo_id)
        .order_by(PRReview.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    reviews = res.scalars().all()
    return {"data": reviews, "page": page}

@router.get("/{repo_id}/policy")
async def get_repository_policy(repo_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Repository).filter(Repository.id == repo_id))
    repo = res.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo.review_config

@router.put("/{repo_id}/policy")
async def update_repository_policy(repo_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Repository).filter(Repository.id == repo_id))
    repo = res.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    repo.review_config = payload
    await db.commit()
    return {"status": "updated", "review_config": repo.review_config}
