"""
AgentScope initialization for PR Sentinel.
Call init_agentscope() once at application startup.
"""
import os
import agentscope
from app.config import settings

def init_agentscope() -> None:
    """Initialize AgentScope with all configured model backends."""
    model_configs = _build_model_configs()

    agentscope.init(
        model_configs=model_configs,
        project="pr-sentinel",
        save_log=True,
        save_code=False,
        logger_level="INFO",
        use_monitor=True,          # Track token usage
    )

def _build_model_configs() -> list:
    configs = []

    # ── Option A: Groq (recommended free LLM) ──
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "gsk_placeholder_api_key":
        configs += [
            {
                "model_type": "openai_chat",   # Groq is OpenAI-compatible
                "config_name": "groq_llama3_70b",
                "model_name": "llama3-70b-8192",
                "api_key": settings.GROQ_API_KEY,
                "client_args": {"base_url": "https://api.groq.com/openai/v1"},
                "generate_args": {"temperature": 0.1, "max_tokens": 4096},
            },
            {
                "model_type": "openai_chat",
                "config_name": "groq_mixtral",
                "model_name": "mixtral-8x7b-32768",
                "api_key": settings.GROQ_API_KEY,
                "client_args": {"base_url": "https://api.groq.com/openai/v1"},
                "generate_args": {"temperature": 0.0, "max_tokens": 8192},
            },
        ]

    # ── Option B: Ollama (completely free, local) ──
    if settings.OLLAMA_BASE_URL:
        configs += [
            {
                "model_type": "ollama_chat",
                "config_name": "ollama_codellama",
                "model_name": "codellama:13b",
                "options": {"temperature": 0.0, "num_ctx": 8192},
            },
            {
                "model_type": "ollama_chat",
                "config_name": "ollama_llama3",
                "model_name": "llama3:8b",
                "options": {"temperature": 0.1, "num_ctx": 4096},
            },
        ]

    # ── Option C: Together AI (free $25 credit) ──
    if settings.TOGETHER_API_KEY:
        configs.append({
            "model_type": "openai_chat",
            "config_name": "together_llama3",
            "model_name": "meta-llama/Llama-3-70b-chat-hf",
            "api_key": settings.TOGETHER_API_KEY,
            "client_args": {"base_url": "https://api.together.xyz/v1"},
            "generate_args": {"temperature": 0.1, "max_tokens": 4096},
        })

    # If no real configs are set, we just use a dummy one for tests so it doesn't crash during development
    if not configs:
        configs.append({
            "model_type": "openai_chat",
            "config_name": "groq_llama3_70b",
            "model_name": "dummy-model",
            "api_key": "dummy",
            "client_args": {"base_url": "http://localhost:1234/v1"}
        })
        configs.append({
            "model_type": "openai_chat",
            "config_name": "groq_mixtral",
            "model_name": "dummy-model",
            "api_key": "dummy",
            "client_args": {"base_url": "http://localhost:1234/v1"}
        })
        
    return configs
