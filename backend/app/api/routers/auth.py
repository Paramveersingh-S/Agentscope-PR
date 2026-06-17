from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

@router.get("/github/callback")
async def github_callback(code: str = None):
    return {"status": "authenticated", "token": "dummy_token"}

@router.post("/logout")
async def logout():
    return {"status": "logged_out"}

@router.get("/me")
async def get_current_user():
    return {"id": "user1", "username": "dummy_user", "role": "admin"}
