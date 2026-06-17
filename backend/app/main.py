from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.agents.agentscope_init import init_agentscope

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init AgentScope, DB connection pools
    init_agentscope()
    yield
    # Shutdown: clean up resources
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
