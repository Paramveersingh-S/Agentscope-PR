from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init AgentScope, DB connection pools
    yield
    # Shutdown: clean up resources

app = FastAPI(
    title="AgentScope PR Sentinel API",
    description="API for the multi-agent PR review system",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "pr_sentinel"}
