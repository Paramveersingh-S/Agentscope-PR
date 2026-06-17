from fastapi import FastAPI
from contextlib import asynccontextmanager
from prometheus_client import make_asgi_app, Counter, Histogram
from app.agents.agentscope_init import init_agentscope
from app.api.webhooks import router as webhooks_router

from app.api.routers.reviews import router as reviews_router
from app.api.routers.findings import router as findings_router
from app.api.routers.repositories import router as repositories_router
from app.api.routers.analytics import router as analytics_router
from app.api.routers.settings import router as settings_router
from app.api.routers.auth import router as auth_router

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

app.include_router(webhooks_router)
app.include_router(reviews_router)
app.include_router(findings_router)
app.include_router(repositories_router)
app.include_router(analytics_router)
app.include_router(settings_router)
app.include_router(auth_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "pr_sentinel"}

# Mount Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

