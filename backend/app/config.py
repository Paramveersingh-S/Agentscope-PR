from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgentScope PR Sentinel"
    
    # DB
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: str
    SYNC_DATABASE_URL: str
    
    # Redis
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: str
    
    # Chroma
    CHROMADB_URL: str = "http://localhost:8000"
    
    # LLMs
    GROQ_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: Optional[str] = None
    TOGETHER_API_KEY: Optional[str] = None
    
    # GitHub
    GITHUB_APP_ID: int
    GITHUB_APP_PRIVATE_KEY: str
    GITHUB_WEBHOOK_SECRET: str
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    
    # Security
    SECRET_KEY: str
    ENCRYPTION_KEY: str
    
    # Langfuse
    LANGFUSE_PUBLIC_KEY: Optional[str] = None
    LANGFUSE_SECRET_KEY: Optional[str] = None
    LANGFUSE_HOST: Optional[str] = None
    
    # Features
    ENABLE_LEARNING: bool = True
    ENABLE_VECTOR_SEARCH: bool = True
    MAX_DIFF_SIZE_CHARS: int = 50000
    DEFAULT_TOKEN_BUDGET: int = 50000
    REVIEW_TIMEOUT_SECONDS: int = 300

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

settings = Settings()
