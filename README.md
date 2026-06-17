<div align="center">
  <img src="https://img.shields.io/badge/AgentScope-0.1.x-blue?style=for-the-badge&logo=python" alt="AgentScope" />
  <img src="https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/ChromaDB-0.5+-FF6B6B?style=for-the-badge" alt="ChromaDB" />

  <h1>🛡️ AgentScope PR Sentinel</h1>
  <p><strong>Enterprise-Grade Multi-Agent Pull Request Intelligence Platform</strong></p>
</div>

<br />

AgentScope PR Sentinel automates and supercharges code review using a fleet of specialized AI agents. It integrates directly with GitHub via webhooks, analyzes pull requests across multiple domains (Security, Performance, Quality, Testing, Documentation, Dependency), and posts synthesized findings directly to the PR while offering a comprehensive Next.js dashboard for engineering teams.

## ✨ Features

- **Multi-Agent Orchestration**: Powered by [AgentScope](https://github.com/modelscope/agentscope), coordinating 7 distinct LLM-driven agents.
- **Deep Domain Analysis**: Specialized agents for Security (OWASP Top 10), Performance, Code Quality, Test Coverage, Documentation, and Dependency Risks.
- **Enterprise-Ready Backend**: Async FastAPI + SQLAlchemy 2.0 with Celery for background processing.
- **Smart Deduplication**: Vector-based finding deduplication using ChromaDB and Sentence Transformers.
- **Real-Time Dashboard**: Next.js 14 App Router frontend featuring live WebSocket updates of agent progress.
- **Observability**: Built-in LangFuse LLM tracing and Prometheus + Grafana metrics.

## 🏗️ Architecture

```mermaid
graph TD
    A[GitHub PR Event] -->|POST /webhooks/github| B[FastAPI Webhook Handler]
    B -->|HMAC Verified, Enqueue| C[Celery Task Queue]
    C -->|Fetch PR Diff| D[PRReviewPipeline]
    
    D --> E[OrchestratorAgent]
    E -->|Parallel Dispatch| F[SecurityAgent]
    E -->|Parallel Dispatch| G[PerformanceAgent]
    E -->|Parallel Dispatch| H[CodeQualityAgent]
    E -->|Parallel Dispatch| I[TestCoverageAgent]
    E -->|Parallel Dispatch| J[DocumentationAgent]
    E -->|Parallel Dispatch| K[DependencyAgent]
    
    F & G & H & I & J & K --> L[AggregatorAgent]
    
    L -->|Post Feedback| M[GitHub PR Comments]
    L -->|Store Findings| N[(PostgreSQL)]
    L -->|Embeddings| O[(ChromaDB)]
    
    N --> P[Next.js Dashboard]
    O --> P
```

## 🚀 Quick Start (Development)

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Node.js 20+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Paramveersingh-S/Agentscope-PR.git
   cd Agentscope-PR
   ```

2. **Environment Configuration**
   Copy the example environment file and fill in your keys (Groq API, GitHub App, etc.):
   ```bash
   cp .env.example .env
   ```

3. **Start the Infrastructure**
   Launch PostgreSQL (pgvector), Redis, and ChromaDB:
   ```bash
   docker compose up -d postgres redis chromadb
   ```

4. **Initialize the Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   ```

## 🛠️ Tech Stack Details

### Backend
- **Python 3.11+**
- **AgentScope 0.1.x** for core multi-agent orchestration
- **FastAPI** for REST endpoints and WebSockets
- **SQLAlchemy 2.0** (Asyncpg) + **Alembic**
- **Celery 5.3+** + Redis as broker

### Frontend
- **Next.js 14** (App Router)
- **TypeScript 5.x**
- **TailwindCSS** + **shadcn/ui**
- **Tanstack Query v5** + **Zustand 4.x**
- **Recharts** for analytics visualization

### LLM Backends
- **Groq API** (Recommended, Free tier available)
- **Ollama** (Local models)
- **Together AI**

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.
