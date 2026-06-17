from fastapi import HTTPException, status
from typing import Dict
import time

# Simple in-memory rate limiter for demo purposes. 
# In production, this would use Redis.
_request_counts: Dict[str, list] = {}

def check_rate_limit(client_ip: str, limit: int = 100, window_sec: int = 60) -> bool:
    """Check if client has exceeded rate limit."""
    current_time = time.time()
    
    if client_ip not in _request_counts:
        _request_counts[client_ip] = []
        
    # Remove timestamps outside the window
    _request_counts[client_ip] = [ts for ts in _request_counts[client_ip] if current_time - ts < window_sec]
    
    if len(_request_counts[client_ip]) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )
        
    _request_counts[client_ip].append(current_time)
    return True
