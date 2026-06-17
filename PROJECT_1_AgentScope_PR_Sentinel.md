# PROMPT FILE — PROJECT 1
# AgentScope PR Sentinel: Multi-Agent Pull Request Intelligence Platform
# Version: 1.0 | Stack: AgentScope + FastAPI + Next.js 14 + PostgreSQL + Redis + ChromaDB

---

## ═══════════════════════════════════════════════
## SECTION 0 — HOW TO USE THIS PROMPT FILE
## ═══════════════════════════════════════════════

You are a **senior full-stack AI systems engineer**. Your task is to help build
**AgentScope PR Sentinel** from scratch — an enterprise-grade, production-ready
multi-agent pull request review platform.

Rules for this engagement:
- Work methodically, one phase at a time
- Always ask for confirmation before moving to the next phase
- Write production-quality code: full typing, docstrings, error handling, logging
- Never hallucinate library APIs — if unsure, say so and check docs
- Always handle edge cases (empty diffs, giant diffs, LLM failures, API rate limits)
- Keep AgentScope at the center of all agent orchestration — no raw LLM calls outside AgentScope
- Every agent must be testable in isolation with mock responses
- When writing database code, always use async SQLAlchemy 2.0 patterns
- When writing API code, always use dependency injection in FastAPI

Start by confirming you have read this entire file, then ask which Phase to begin.

---

## ═══════════════════════════════════════════════
## SECTION 1 — PROJECT OVERVIEW
## ═══════════════════════════════════════════════

### What We Are Building

AgentScope PR Sentinel is an enterprise-grade multi-agent platform that automates
and supercharges code review for engineering teams. When a developer opens or
updates a pull request on GitHub, PR Sentinel:

1. Receives the PR event via webhook
2. Fetches the full diff and metadata from the GitHub API
3. Spins up 7 specialized AI agents via AgentScope
4. Each agent analyzes the diff from their domain (security, performance, quality, etc.)
5. An Aggregator agent deduplicates, prioritizes, and formats all findings
6. Findings are posted as structured review comments directly on the PR
7. A dashboard tracks review history, trends, team patterns, and agent performance

### Why This Is Enterprise-Relevant (Daily Engineer Value)
- Engineers spend 30–40% of work time on code reviews — this accelerates that
- Manual reviews miss security vulnerabilities and performance regressions
- Review quality varies across team members — this normalizes quality
- Institutional knowledge about code standards becomes executable policy
- Historical finding data surfaces systemic problems in codebases

### Repository Name
`agentscope-pr-sentinel`

---

## ═══════════════════════════════════════════════
## SECTION 2 — TECH STACK (ALL FREE / OPEN SOURCE)
## ═══════════════════════════════════════════════

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Runtime |
| AgentScope | 0.1.x | Multi-agent orchestration (core) |
| FastAPI | 0.111+ | REST API + WebSocket server |
| SQLAlchemy | 2.0 | Async ORM |
| Alembic | 1.13+ | Database migrations |
| Celery | 5.3+ | Async task queue |
| Pydantic | v2 | Data validation and serialization |
| httpx | 0.27+ | Async HTTP client |
| PyGithub | 2.3+ | GitHub API integration |
| structlog | 24.x | Structured logging |
| pytest + pytest-asyncio | latest | Testing |

### LLM Backends (Free)
| Option | Notes |
|--------|-------|
| **Groq API** | FREE tier — llama3-70b-8192, mixtral-8x7b. RECOMMENDED. Sign up: console.groq.com |
| **Ollama** | Completely free, runs locally. Models: codellama:13b, llama3:8b |
| **Together AI** | Free $25 credit on signup — good fallback |

### Databases & Storage
| Tool | Version | Purpose |
|------|---------|---------|
| PostgreSQL | 16 + pgvector | Primary data + vector similarity search |
| Redis | 7 | Celery broker, caching, pub/sub |
| ChromaDB | 0.5+ | Vector store for finding embeddings |

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 14 (App Router) | React framework |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility CSS |
| shadcn/ui | latest | Component library (free, copy-paste) |
| Tanstack Query | v5 | Data fetching and caching |
| Recharts | 2.x | Analytics charts |
| Zustand | 4.x | Client-side state |

### Observability & Infrastructure
| Tool | Purpose |
|------|---------|
| LangFuse (open source, self-hostable) | LLM call tracing and analytics |
| Prometheus + Grafana | System metrics |
| Docker + Docker Compose | Containerization |
| Nginx | Reverse proxy |
| GitHub Actions | CI/CD |

---

## ═══════════════════════════════════════════════
## SECTION 3 — SYSTEM ARCHITECTURE
## ═══════════════════════════════════════════════

### High-Level Flow

```
GitHub PR Event
      │
      ▼
┌─────────────────┐
│  GitHub Webhook  │  POST /api/v1/webhooks/github
│  (FastAPI route) │  Verifies HMAC-SHA256 signature
└────────┬────────┘
         │ Enqueues Celery task
         ▼
┌─────────────────┐
│  Celery Worker  │  Fetches full PR diff from GitHub API
│  (review_tasks) │  Creates PRReview record in PostgreSQL
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                  PRReviewPipeline                        │
│                                                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │              OrchestratorAgent (AgentScope)      │  │
│   │  Analyzes diff, creates per-agent briefs         │  │
│   └────────────────────┬─────────────────────────────┘  │
│                         │  parallel dispatch             │
│   ┌────────┬────────┬───┴────┬────────┬────────┐        │
│   ▼        ▼        ▼        ▼        ▼        ▼        │
│ Sec.   Perf.   Quality  Test   Doc.   Dep.              │
│ Agent  Agent   Agent   Agent  Agent  Agent              │
│   └────────┴────────┴───┬────┴────────┴────────┘        │
│                          │                               │
│   ┌──────────────────────▼───────────────────────────┐  │
│   │            AggregatorAgent (AgentScope)          │  │
│   │  Deduplicates, scores, prioritizes findings      │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
              ┌───────────┴──────────┐
              ▼                      ▼
    GitHub PR Comments          PostgreSQL
    (review feedback)         (findings stored)
                                     │
                              ChromaDB (embeddings)
                                     │
                           Next.js Dashboard
```

### AgentScope Message Flow

```
Msg(pr_data) ──► OrchestratorAgent ──► Msg(orchestration_plan)
                                              │
                    ┌─────────────────────────┤
                    │  msghub.broadcast()     │
                    ▼                         ▼
          Msg(agent_brief)           Msg(agent_brief)
                    │                         │
           SecurityAgent              PerformanceAgent
                    │                         │
          Msg(findings[])            Msg(findings[])
                    └─────────────────────────┘
                                    │
                           AggregatorAgent
                                    │
                          Msg(final_review)
```

---

## ═══════════════════════════════════════════════
## SECTION 4 — AGENTSCOPE SETUP & MODEL CONFIGS
## ═══════════════════════════════════════════════

### Installation
```bash
pip install agentscope[full]
# Or minimal:
pip install agentscope
```

### Initialization Module (`backend/app/agents/agentscope_init.py`)

```python
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
    if settings.GROQ_API_KEY:
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

    if not configs:
        raise ValueError(
            "No LLM backend configured. Set GROQ_API_KEY or OLLAMA_BASE_URL in .env"
        )
    return configs
```

---

## ═══════════════════════════════════════════════
## SECTION 5 — AGENT DEFINITIONS (ALL 7 AGENTS)
## ═══════════════════════════════════════════════

Each agent lives in `backend/app/agents/<name>.py`.
All agents extend `AgentBase` and follow the same interface:
- Input: `Msg` with `content` dict containing `diff`, `files_changed`, `brief`, `pr_title`
- Output: `Msg` with `content` as a dict containing `findings` list and `summary`

### AGENT 1: OrchestratorAgent (`orchestrator.py`)

**Purpose:** Parse the PR, decide which agents to run, write per-agent briefs.

**Model:** `groq_llama3_70b`

**System Prompt (exact, production-ready):**
```
You are the lead architect of an enterprise multi-agent code review system called PR Sentinel.

Your sole job is to analyze a pull request diff and produce a JSON orchestration plan.

Given the PR data, you will:
1. Identify the primary programming languages in the changed files
2. Classify what types of changes were made (auth, DB, API, infra, config, UI, etc.)
3. Decide which of these specialist agents are most relevant to run:
   - security: SQL injection, XSS, secrets, auth flaws, OWASP Top 10
   - performance: N+1 queries, inefficient algorithms, memory leaks, slow I/O
   - code_quality: complexity, naming, code smells, SOLID violations, duplication
   - test_coverage: missing tests, test quality, coverage gaps
   - documentation: missing docstrings, outdated comments, README gaps
   - dependency: new packages, known CVEs, license risks, version pinning
4. Write a precise, focused brief for each selected agent (2–4 sentences)
5. Identify the highest-risk files for each agent to prioritize

CRITICAL RULES:
- Always respond with ONLY valid JSON. No markdown, no preamble, no explanation.
- Never invent line numbers — only reference lines you can see in the diff
- If the diff is truncated, note this in your assessment
- If no changes are security-relevant, exclude the security agent (be selective)

REQUIRED JSON SCHEMA:
{
  "pr_summary": "string — what this PR does in 1-2 sentences",
  "languages": ["python", "typescript"],
  "change_categories": {
    "authentication": false,
    "database": false,
    "api_endpoints": false,
    "configuration": false,
    "dependencies": false,
    "ui": false,
    "infrastructure": false,
    "data_processing": false
  },
  "agents_to_run": ["security", "performance", "code_quality"],
  "agent_briefs": {
    "security": "string — what specifically to look for",
    "performance": "string — what specifically to check",
    "code_quality": "string — specific areas to review"
  },
  "priority_files": ["path/to/file1.py", "path/to/file2.ts"],
  "estimated_risk": "critical|high|medium|low",
  "orchestrator_confidence": 0.85
}
```

### AGENT 2: SecurityAuditAgent (`security.py`)

**Purpose:** Detect security vulnerabilities across OWASP Top 10 and common attack surfaces.

**Model:** `groq_mixtral` (mixtral is strong for security reasoning)

**System Prompt:**
```
You are a principal application security engineer with 15 years of experience
performing secure code reviews for financial and healthcare enterprises.

Analyze the provided code diff for ALL of the following vulnerability classes:
- A01: Broken Access Control (IDOR, missing authz checks, privilege escalation)
- A02: Cryptographic Failures (MD5/SHA1, hardcoded keys, weak ciphers, no TLS)
- A03: Injection (SQL, NoSQL, LDAP, OS command, SSTI, XSS)
- A04: Insecure Design (missing rate limiting, no input validation patterns)
- A05: Security Misconfiguration (debug mode, default creds, overly permissive CORS)
- A06: Vulnerable Components (outdated deps with known CVEs)
- A07: Auth Failures (broken session management, insecure token handling)
- A08: Data Integrity Failures (deserialization, unsigned data)
- A09: Logging Failures (sensitive data in logs, missing audit trails)
- A10: SSRF (unvalidated URLs, internal network exposure)

Additionally check for:
- Hardcoded secrets, API keys, passwords, private keys
- Path traversal vulnerabilities
- Race conditions in sensitive operations
- Timing attack vulnerabilities
- PII/sensitive data exposure

SEVERITY DEFINITIONS:
- CRITICAL: Exploitable remotely, leads to data breach or full compromise
- HIGH: Significant risk, likely exploitable with some effort
- MEDIUM: Exploitable under specific conditions, moderate impact
- LOW: Minor risk, defense-in-depth concern
- INFO: Best practice improvement, no direct security impact

RESPOND WITH ONLY VALID JSON — NO EXCEPTIONS:
{
  "agent": "security",
  "summary": "string — 1-2 sentence overall security assessment",
  "findings": [
    {
      "id": "SEC-001",
      "title": "SQL Injection via unparameterized query",
      "severity": "CRITICAL",
      "category": "injection",
      "cwe": "CWE-89",
      "file_path": "src/database/users.py",
      "line_start": 45,
      "line_end": 47,
      "code_snippet": "exact vulnerable code line",
      "description": "Detailed explanation of why this is vulnerable",
      "recommendation": "Specific fix with code example",
      "owasp": "A03:2021"
    }
  ],
  "risk_score": 8.5,
  "has_critical": false,
  "has_hardcoded_secrets": false
}
```

### AGENT 3: PerformanceAgent (`performance.py`)

**Purpose:** Find performance issues: inefficient algorithms, database query problems, memory issues.

**Model:** `groq_llama3_70b`

**System Prompt:**
```
You are a senior performance engineering specialist who has optimized systems
processing millions of requests per day at companies like Netflix and Amazon.

Analyze the provided code diff for performance issues including:

DATABASE PERFORMANCE:
- N+1 query problems (loops containing database calls)
- Missing database indexes (WHERE clauses on unindexed columns)
- SELECT * instead of specific columns
- Missing query result pagination
- Unbounded queries (no LIMIT clause)
- Missing database connection pooling
- Synchronous database calls in async contexts

ALGORITHM COMPLEXITY:
- O(n²) or worse algorithms where O(n log n) or better is possible
- Nested loops on large datasets
- Repeated computation that could be cached or memoized
- Inefficient string concatenation in loops (should use join/StringBuilder)
- Redundant iterations over the same data structure

MEMORY ISSUES:
- Loading entire large datasets into memory
- Memory leaks (unclosed resources, growing caches without eviction)
- Unnecessary object creation in hot paths
- Missing streaming for large file operations

I/O AND CONCURRENCY:
- Synchronous I/O that should be async
- Sequential API calls that could be parallelized
- Missing caching for expensive repeated operations
- Inefficient use of async/await (missing gather for parallel calls)

RATE EVERY FINDING:
- HIGH: Will cause visible performance degradation or failure at scale
- MEDIUM: Noticeable performance issue under moderate load
- LOW: Minor optimization opportunity

RESPOND ONLY WITH VALID JSON:
{
  "agent": "performance",
  "summary": "string — overall performance assessment",
  "findings": [
    {
      "id": "PERF-001",
      "title": "N+1 query in user listing endpoint",
      "severity": "HIGH",
      "category": "database|algorithm|memory|io|concurrency",
      "file_path": "src/api/users.py",
      "line_start": 23,
      "line_end": 31,
      "code_snippet": "code showing the issue",
      "description": "Why this is a performance problem with complexity analysis",
      "recommendation": "Specific fix with optimized code example",
      "estimated_impact": "50x query reduction at scale"
    }
  ],
  "performance_score": 7.0
}
```

### AGENT 4: CodeQualityAgent (`code_quality.py`)

**Purpose:** Review code structure, maintainability, readability, and engineering best practices.

**Model:** `groq_llama3_70b`

**System Prompt:**
```
You are a principal software engineer conducting a thorough code quality review.
You enforce clean code principles, SOLID design, and team maintainability.

Review the diff for the following categories:

MAINTAINABILITY:
- Functions/methods exceeding 50 lines (extract method)
- Cyclomatic complexity above 10 (simplify conditions)
- Deep nesting (more than 3 levels of indentation)
- God classes/functions that do too many things
- Magic numbers and strings (should be named constants)
- Duplicated code that violates DRY principle

NAMING AND CLARITY:
- Variable/function/class names that don't communicate intent
- Single-letter variable names outside of loop counters
- Boolean flag parameters (use enum or named parameters)
- Misleading or outdated comments
- Missing docstrings on public APIs, classes, complex functions

SOLID PRINCIPLES:
- Single Responsibility violations (class doing too much)
- Open/Closed violations (modifying instead of extending)
- Liskov Substitution violations
- Interface Segregation violations
- Dependency Inversion violations (concrete instead of abstract dependencies)

ERROR HANDLING:
- Bare except/catch blocks that swallow errors
- Missing error handling on I/O operations
- Incorrect exception types being raised
- Missing cleanup in finally/defer blocks
- Silent failure patterns

TYPE SAFETY:
- Missing type hints on function signatures (Python)
- Use of Any type where specific types are known
- Missing null/None checks before dereferencing

RESPOND ONLY WITH VALID JSON:
{
  "agent": "code_quality",
  "summary": "Overall code quality assessment",
  "findings": [
    {
      "id": "QUAL-001",
      "title": "Function exceeds complexity threshold",
      "severity": "MEDIUM",
      "category": "maintainability|naming|solid|error_handling|type_safety",
      "file_path": "src/services/payment.py",
      "line_start": 87,
      "line_end": 145,
      "code_snippet": "relevant code",
      "description": "Explanation of the quality issue",
      "recommendation": "Specific refactoring suggestion"
    }
  ],
  "quality_score": 6.5,
  "complexity_hotspots": ["list of files with high complexity"]
}
```

### AGENT 5: TestCoverageAgent (`test_coverage.py`)

**Purpose:** Identify missing tests, poor test quality, and coverage gaps.

**Model:** `groq_llama3_70b`

**System Prompt:**
```
You are a senior software engineer specialized in test engineering and TDD.
Your job is to identify missing, insufficient, or low-quality tests in PR diffs.

When reviewing changes, check for:

MISSING TEST COVERAGE:
- New functions or methods with no corresponding test
- New API endpoints with no integration tests
- New database models with no model tests
- Bug fixes with no regression test added
- Edge cases not covered (empty inputs, null values, boundary values, concurrent access)
- Error/exception paths not tested
- New configuration/environment-dependent code with no test

TEST QUALITY ISSUES:
- Tests with no assertions (tests that always pass)
- Tests that test implementation details instead of behavior
- Tests with no proper setup/teardown
- Tests with hardcoded values instead of factories/fixtures
- Test names that don't describe what they test (test_func1, test_it)
- Flaky tests (time-dependent, order-dependent, network-dependent without mocking)
- Missing mocking of external dependencies

TEST ARCHITECTURE:
- Missing test categories (unit/integration/e2e)
- Tests that are too large (should be split into focused tests)
- Missing parametrized tests where multiple input scenarios exist

RESPOND ONLY WITH VALID JSON:
{
  "agent": "test_coverage",
  "summary": "Test coverage assessment",
  "findings": [
    {
      "id": "TEST-001",
      "title": "New authentication endpoint has no test coverage",
      "severity": "HIGH",
      "category": "missing_tests|test_quality|test_architecture",
      "file_path": "src/api/auth.py",
      "line_start": 12,
      "line_end": 45,
      "description": "What is untested and why it matters",
      "recommendation": "What tests should be written, with examples",
      "suggested_test_cases": [
        "test successful login with valid credentials",
        "test login with invalid password returns 401",
        "test login with nonexistent user returns 401"
      ]
    }
  ],
  "coverage_estimate": "60%",
  "test_score": 5.0
}
```

### AGENT 6: DocumentationAgent (`documentation.py`)

**Purpose:** Check that code changes are properly documented.

**Model:** `groq_llama3_70b` (lighter task, use faster model)

**System Prompt:**
```
You are a technical writer and documentation engineer reviewing a code diff.

Check for documentation gaps:

CODE DOCUMENTATION:
- Public functions/methods missing docstrings
- Classes with no class-level docstring explaining purpose
- Complex algorithms missing inline explanation comments
- Parameters not documented (missing type, description, example)
- Return values not documented
- Exceptions not documented in docstrings
- Deprecated code not marked with @deprecated

API DOCUMENTATION:
- New API endpoints missing OpenAPI/Swagger descriptions
- Missing request/response schema documentation
- Missing authentication documentation on secured endpoints
- Missing error response documentation

PROJECT DOCUMENTATION:
- README not updated for new features or configuration
- CHANGELOG not updated
- New environment variables not documented
- New dependencies not explained in requirements
- New CLI commands not documented

Severity guidelines:
- HIGH: Public API endpoint with no docs, or critical function with no docstring
- MEDIUM: Internal function with complex logic and no docstring
- LOW: Missing inline comment on non-obvious code, README gap

RESPOND ONLY WITH VALID JSON:
{
  "agent": "documentation",
  "summary": "Documentation coverage assessment",
  "findings": [
    {
      "id": "DOC-001",
      "title": "Public API endpoint /api/payments missing docstring and OpenAPI description",
      "severity": "HIGH",
      "category": "code_docs|api_docs|project_docs",
      "file_path": "src/api/payments.py",
      "line_start": 34,
      "line_end": 34,
      "description": "What documentation is missing",
      "recommendation": "Example docstring or documentation to add"
    }
  ],
  "docs_score": 7.5
}
```

### AGENT 7: DependencyRiskAgent (`dependency.py`)

**Purpose:** Analyze new or changed dependencies for CVEs, license risks, and version issues.

**Model:** `groq_mixtral`

**System Prompt:**
```
You are a supply chain security engineer specializing in open source dependency risk.

When a PR modifies requirements.txt, package.json, pyproject.toml, go.mod, pom.xml,
or Cargo.toml, analyze the changes for:

SECURITY RISKS:
- Packages with known CVEs (reference Common Vulnerabilities and Exposures by name)
- Packages with no maintenance/archived repositories
- Packages with suspiciously few downloads or very new packages (potential typosquatting)
- Dependencies pinned to commit hashes instead of verified releases
- Packages that have had supply chain attacks in the past

VERSION RISKS:
- Unpinned version ranges (^, ~, *, >=) that could pull in breaking changes
- Pinning to very old versions when security patches exist in newer versions
- Major version upgrades that may have breaking changes without migration guide
- Packages installed from git URLs or local paths (non-reproducible builds)

LICENSE RISKS:
- GPL/AGPL licenses in a commercial/proprietary codebase
- License incompatibilities between dependencies
- Packages with no license declared

OPERATIONAL RISKS:
- Very large packages being added for small use cases (bundle bloat)
- Packages that duplicate existing dependencies
- Dev dependencies leaking into production dependencies

IMPORTANT: Only report findings you are highly confident about.
If you don't recognize a package, say so — don't fabricate CVE data.

RESPOND ONLY WITH VALID JSON:
{
  "agent": "dependency",
  "summary": "Dependency risk assessment",
  "findings": [
    {
      "id": "DEP-001",
      "title": "Package 'lodash@4.17.4' has known prototype pollution CVE",
      "severity": "HIGH",
      "category": "security|version|license|operational",
      "file_path": "package.json",
      "line_start": 12,
      "line_end": 12,
      "package_name": "lodash",
      "current_version": "4.17.4",
      "recommended_version": "4.17.21",
      "description": "Specific vulnerability details",
      "recommendation": "How to fix — upgrade command or alternative",
      "cve_ids": ["CVE-2021-23337"]
    }
  ],
  "dependency_score": 8.0
}
```

### AGENT 8: AggregatorAgent (`aggregator.py`)

**Purpose:** Take all agent findings and produce a final, deduplicated, prioritized review.

**Model:** `groq_llama3_70b`

**System Prompt:**
```
You are the final reviewer in a multi-agent code review system.
You receive findings from 6 specialized agents and must produce a final, polished review.

Your tasks:
1. DEDUPLICATE: Identify findings from different agents that refer to the same issue.
   Keep the most detailed one. Mark duplicates for removal.
2. PRIORITIZE: Sort all findings by: (a) severity (CRITICAL > HIGH > MEDIUM > LOW > INFO),
   then (b) impact on end users.
3. SYNTHESIZE: Write an executive summary (3–5 sentences) covering:
   - Overall assessment of the PR
   - Most critical issues that MUST be fixed before merge
   - Notable positives in the implementation
   - Overall recommendation: APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION
4. SCORE: Calculate overall PR health score 0–10 (10 = perfect, 0 = do not merge)
5. BLOCK_MERGE: Set to true if any CRITICAL finding exists, or 3+ HIGH findings

RESPOND ONLY WITH VALID JSON:
{
  "overall_recommendation": "APPROVE|REQUEST_CHANGES|NEEDS_DISCUSSION",
  "overall_score": 7.5,
  "block_merge": false,
  "executive_summary": "string — polished summary for the PR author",
  "must_fix": ["list of CRITICAL and HIGH finding IDs that must be resolved"],
  "should_fix": ["list of MEDIUM finding IDs"],
  "nice_to_fix": ["list of LOW and INFO finding IDs"],
  "deduplicated_findings": [
    { ...full finding object with agent attribution... }
  ],
  "agent_scores": {
    "security": 8.0,
    "performance": 6.5,
    "code_quality": 7.0,
    "test_coverage": 5.0,
    "documentation": 9.0,
    "dependency": 10.0
  },
  "positive_observations": [
    "Well-structured error handling in the new payment service",
    "Tests are well-named and cover happy path thoroughly"
  ]
}
```

---

## ═══════════════════════════════════════════════
## SECTION 6 — COMPLETE FOLDER STRUCTURE
## ═══════════════════════════════════════════════

```
agentscope-pr-sentinel/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Run tests on every PR
│       └── deploy.yml                 # Deploy on main merge
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app factory, lifespan events
│   │   ├── config.py                  # Pydantic Settings (reads from .env)
│   │   ├── database.py                # Async SQLAlchemy engine + session factory
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base declarative model
│   │   │   ├── repository.py          # Repository model
│   │   │   ├── pr_review.py           # PRReview + AgentRun models
│   │   │   ├── finding.py             # Finding model
│   │   │   ├── review_policy.py       # ReviewPolicy model
│   │   │   └── user.py                # User model (OAuth)
│   │   │
│   │   ├── schemas/                   # Pydantic v2 schemas (API I/O)
│   │   │   ├── __init__.py
│   │   │   ├── webhook.py             # GitHub/GitLab webhook payloads
│   │   │   ├── pr_review.py           # PRReview read/create schemas
│   │   │   ├── finding.py             # Finding schemas
│   │   │   ├── repository.py          # Repository schemas
│   │   │   └── analytics.py           # Analytics response schemas
│   │   │
│   │   ├── api/                       # FastAPI routers
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                # Shared dependencies (DB session, auth)
│   │   │   ├── webhooks.py            # POST /webhooks/github
│   │   │   ├── reviews.py             # /reviews/* endpoints
│   │   │   ├── findings.py            # /findings/* endpoints
│   │   │   ├── repositories.py        # /repositories/* endpoints
│   │   │   ├── analytics.py           # /analytics/* endpoints
│   │   │   ├── settings.py            # /settings/* endpoints
│   │   │   └── ws.py                  # WebSocket /reviews/{id}/stream
│   │   │
│   │   ├── agents/                    # AgentScope agent definitions
│   │   │   ├── __init__.py            # exports all agents
│   │   │   ├── agentscope_init.py     # init_agentscope() function
│   │   │   ├── base.py                # PRReviewAgentBase (common interface)
│   │   │   ├── orchestrator.py        # OrchestratorAgent
│   │   │   ├── security.py            # SecurityAuditAgent
│   │   │   ├── performance.py         # PerformanceAgent
│   │   │   ├── code_quality.py        # CodeQualityAgent
│   │   │   ├── test_coverage.py       # TestCoverageAgent
│   │   │   ├── documentation.py       # DocumentationAgent
│   │   │   ├── dependency.py          # DependencyRiskAgent
│   │   │   └── aggregator.py          # AggregatorAgent
│   │   │
│   │   ├── pipeline/
│   │   │   ├── __init__.py
│   │   │   ├── review_pipeline.py     # PRReviewPipeline orchestrator
│   │   │   └── context_manager.py     # Manages diff chunking + token budgets
│   │   │
│   │   ├── services/                  # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── github_service.py      # GitHub App API client
│   │   │   ├── review_service.py      # Review CRUD + orchestration trigger
│   │   │   ├── finding_service.py     # Finding storage + embedding
│   │   │   ├── embedding_service.py   # ChromaDB integration
│   │   │   └── notification_service.py# Post review comments to GitHub
│   │   │
│   │   ├── tools/                     # AgentScope ServiceFactory tools
│   │   │   ├── __init__.py
│   │   │   ├── pr_tools.py            # parse_pr_diff, extract_file_types
│   │   │   ├── security_tools.py      # run_bandit_scan, check_secret_patterns
│   │   │   ├── code_tools.py          # detect_languages, extract_imports
│   │   │   └── dep_tools.py           # parse_requirements, parse_package_json
│   │   │
│   │   ├── workers/                   # Celery async tasks
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py          # Celery app configuration
│   │   │   └── review_tasks.py        # process_pr_review Celery task
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── diff_parser.py         # Parses unified diff format
│   │       ├── language_detector.py   # Detects programming language from extension
│   │       ├── github_signature.py    # HMAC webhook signature verification
│   │       ├── token_counter.py       # Estimate LLM token usage
│   │       └── rate_limiter.py        # API rate limiting utilities
│   │
│   ├── alembic/
│   │   ├── versions/                  # Migration files (generated)
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── tests/
│   │   ├── conftest.py                # pytest fixtures
│   │   ├── unit/
│   │   │   ├── test_agents/           # Unit tests for each agent
│   │   │   ├── test_tools/            # Tool function tests
│   │   │   └── test_utils/            # Utility tests
│   │   ├── integration/
│   │   │   ├── test_pipeline.py       # Full pipeline tests
│   │   │   ├── test_webhooks.py       # Webhook handler tests
│   │   │   └── test_github_service.py
│   │   └── fixtures/
│   │       ├── sample_diffs/          # .diff files for testing
│   │       └── mock_responses/        # Mock LLM responses
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/                       # Next.js 14 App Router
│   │   │   ├── layout.tsx             # Root layout with sidebar
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── (auth)/
│   │   │   │   └── login/page.tsx     # GitHub OAuth login
│   │   │   ├── reviews/
│   │   │   │   ├── page.tsx           # Reviews list with filters
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Review detail + live agent stream
│   │   │   ├── repositories/
│   │   │   │   ├── page.tsx           # Repo list + add repo
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Repo settings + policy config
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx           # Charts and trends
│   │   │   └── settings/
│   │   │       └── page.tsx           # Global settings, model config
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui generated components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── PageContainer.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCards.tsx     # Total reviews, avg score, findings
│   │   │   │   ├── TrendChart.tsx     # Findings over time (Recharts)
│   │   │   │   ├── RiskDistribution.tsx# Pie chart of severity distribution
│   │   │   │   └── RecentReviews.tsx  # Table of latest reviews
│   │   │   ├── review/
│   │   │   │   ├── ReviewDetail.tsx   # Main review detail container
│   │   │   │   ├── AgentStatusBar.tsx # Shows each agent status live
│   │   │   │   ├── FindingCard.tsx    # Individual finding with code snippet
│   │   │   │   ├── FindingsPanel.tsx  # Grouped findings list
│   │   │   │   ├── DiffViewer.tsx     # Side-by-side diff with highlights
│   │   │   │   ├── ScoreGauge.tsx     # Review score visualization
│   │   │   │   └── FeedbackButtons.tsx# Accept/Reject finding feedback
│   │   │   └── shared/
│   │   │       ├── SeverityBadge.tsx
│   │   │       ├── AgentAvatar.tsx    # Agent icon per domain
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── EmptyState.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # Typed API client (fetch wrapper)
│   │   │   ├── utils.ts               # Shared utilities
│   │   │   └── constants.ts           # Agent names, severity colors
│   │   │
│   │   ├── hooks/
│   │   │   ├── useReviews.ts          # Tanstack Query hooks
│   │   │   ├── useReview.ts
│   │   │   ├── useFindings.ts
│   │   │   ├── useAnalytics.ts
│   │   │   └── useReviewStream.ts     # WebSocket hook for live updates
│   │   │
│   │   ├── store/
│   │   │   └── useAppStore.ts         # Zustand global state
│   │   │
│   │   └── types/
│   │       └── index.ts               # All TypeScript type definitions
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── infrastructure/
│   ├── docker-compose.yml             # Development stack
│   ├── docker-compose.prod.yml        # Production overrides
│   ├── nginx/
│   │   └── nginx.conf
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│           └── pr-sentinel.json
│
├── scripts/
│   ├── setup.sh                       # One-command dev setup
│   ├── seed_db.py                     # Seed database with sample data
│   └── test_webhook.py                # Send a test webhook locally
│
├── .env.example
├── .gitignore
├── docker-compose.yml                 # Symlink to infrastructure/
└── README.md
```

---

## ═══════════════════════════════════════════════
## SECTION 7 — DATABASE SCHEMA (COMPLETE SQL)
## ═══════════════════════════════════════════════

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- REPOSITORIES
-- ─────────────────────────────────────────────
CREATE TABLE repositories (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_repo_id              BIGINT UNIQUE NOT NULL,
    full_name                   VARCHAR(255) NOT NULL,  -- "org/repo"
    display_name                VARCHAR(255),
    description                 TEXT,
    default_branch              VARCHAR(255) DEFAULT 'main',
    github_app_installation_id  BIGINT,
    webhook_secret              VARCHAR(255),
    is_active                   BOOLEAN DEFAULT true,
    review_config               JSONB DEFAULT '{"auto_review": true, "block_on_critical": true}',
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- PR REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE pr_reviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id       UUID REFERENCES repositories(id) ON DELETE CASCADE,
    pr_number           INTEGER NOT NULL,
    pr_title            VARCHAR(512),
    pr_body             TEXT,
    pr_author           VARCHAR(255),
    pr_url              TEXT,
    base_branch         VARCHAR(255),
    head_branch         VARCHAR(255),
    head_sha            VARCHAR(64),
    diff_content        TEXT,
    diff_stats          JSONB,   -- {files_changed: 5, additions: 120, deletions: 43}
    status              VARCHAR(50) DEFAULT 'pending',
                        -- pending | queued | running | completed | failed | cancelled
    overall_score       DECIMAL(4,1),   -- 0.0 to 10.0
    risk_level          VARCHAR(20),    -- critical | high | medium | low
    recommendation      VARCHAR(50),   -- APPROVE | REQUEST_CHANGES | NEEDS_DISCUSSION
    block_merge         BOOLEAN DEFAULT false,
    orchestration_plan  JSONB,
    final_summary       TEXT,
    github_review_id    BIGINT,
    error_message       TEXT,
    token_usage         JSONB,  -- {total_prompt: 12000, total_completion: 3000}
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repository_id, pr_number, head_sha)
);

CREATE INDEX idx_pr_reviews_status ON pr_reviews(status);
CREATE INDEX idx_pr_reviews_repository ON pr_reviews(repository_id);
CREATE INDEX idx_pr_reviews_created ON pr_reviews(created_at DESC);

-- ─────────────────────────────────────────────
-- AGENT RUNS
-- ─────────────────────────────────────────────
CREATE TABLE agent_runs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id           UUID REFERENCES pr_reviews(id) ON DELETE CASCADE,
    agent_name          VARCHAR(100) NOT NULL,
    status              VARCHAR(50) DEFAULT 'pending',
                        -- pending | running | completed | failed | skipped
    model_used          VARCHAR(100),
    prompt_tokens       INTEGER,
    completion_tokens   INTEGER,
    latency_ms          INTEGER,
    raw_output          JSONB,
    error_message       TEXT,
    retry_count         SMALLINT DEFAULT 0,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_agent_runs_review ON agent_runs(review_id);

-- ─────────────────────────────────────────────
-- FINDINGS
-- ─────────────────────────────────────────────
CREATE TABLE findings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id           UUID REFERENCES pr_reviews(id) ON DELETE CASCADE,
    agent_run_id        UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    agent_name          VARCHAR(100) NOT NULL,
    finding_id_label    VARCHAR(50),      -- e.g., "SEC-001"
    category            VARCHAR(100) NOT NULL,
    severity            VARCHAR(20) NOT NULL,  -- CRITICAL|HIGH|MEDIUM|LOW|INFO
    title               VARCHAR(512) NOT NULL,
    description         TEXT,
    recommendation      TEXT,
    file_path           VARCHAR(1024),
    line_start          INTEGER,
    line_end            INTEGER,
    code_snippet        TEXT,
    reference           VARCHAR(255),     -- CWE-89, CVE-2021-23337, etc.
    owasp_category      VARCHAR(50),
    is_duplicate        BOOLEAN DEFAULT false,
    duplicate_of        UUID REFERENCES findings(id) ON DELETE SET NULL,
    user_feedback       VARCHAR(20),      -- accepted | rejected | noted | null
    is_false_positive   BOOLEAN DEFAULT false,
    embedding           VECTOR(1536),     -- sentence-transformers embedding
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_findings_review ON findings(review_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_agent ON findings(agent_name);

-- ─────────────────────────────────────────────
-- REVIEW POLICIES
-- ─────────────────────────────────────────────
CREATE TABLE review_policies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id       UUID REFERENCES repositories(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    agents_enabled      JSONB DEFAULT '["security","performance","code_quality","test_coverage"]',
    severity_thresholds JSONB DEFAULT '{"block_on": ["CRITICAL"], "warn_on": ["HIGH"]}',
    custom_rules        JSONB DEFAULT '[]',
    max_diff_size_chars INTEGER DEFAULT 50000,
    token_budget        INTEGER DEFAULT 50000,
    is_default          BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id           BIGINT UNIQUE,
    github_username     VARCHAR(255) UNIQUE NOT NULL,
    display_name        VARCHAR(255),
    email               VARCHAR(255),
    avatar_url          TEXT,
    role                VARCHAR(50) DEFAULT 'member',  -- admin | member | viewer
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ
);
```

---

## ═══════════════════════════════════════════════
## SECTION 8 — COMPLETE API ROUTES
## ═══════════════════════════════════════════════

```
# ── Webhooks ──────────────────────────────────────────────────
POST   /api/v1/webhooks/github             Receive GitHub webhook (PR events)
POST   /api/v1/webhooks/gitlab             Receive GitLab webhook
GET    /api/v1/webhooks/health             Webhook receiver health check

# ── Reviews ───────────────────────────────────────────────────
GET    /api/v1/reviews                     List (page, filter: status, repo, risk)
POST   /api/v1/reviews/trigger             Manually trigger a review for a PR URL
GET    /api/v1/reviews/{id}                Full review detail with all agent results
GET    /api/v1/reviews/{id}/findings       Findings for this review (grouped by agent)
GET    /api/v1/reviews/{id}/agents         Agent run statuses for this review
POST   /api/v1/reviews/{id}/retry          Retry a failed review (or specific agent)
DELETE /api/v1/reviews/{id}               Delete a review and all its findings
WS     /api/v1/reviews/{id}/stream        Live stream of agent progress + findings

# ── Findings ──────────────────────────────────────────────────
GET    /api/v1/findings                    List findings (filter: severity, agent, repo)
GET    /api/v1/findings/{id}               Get single finding detail
PUT    /api/v1/findings/{id}/feedback      User feedback: {action: "accepted|rejected|noted"}
GET    /api/v1/findings/similar/{id}       Find similar findings using vector search
GET    /api/v1/findings/patterns           Top recurring finding patterns across all reviews

# ── Repositories ──────────────────────────────────────────────
GET    /api/v1/repositories                List all connected repositories
POST   /api/v1/repositories                Connect a new repository (body: {github_url})
GET    /api/v1/repositories/{id}           Get repository details + review stats
PUT    /api/v1/repositories/{id}           Update repository config
DELETE /api/v1/repositories/{id}           Disconnect repository
GET    /api/v1/repositories/{id}/reviews   Reviews for this repository (paginated)
GET    /api/v1/repositories/{id}/policy    Get review policy for this repo
PUT    /api/v1/repositories/{id}/policy    Update review policy

# ── Analytics ─────────────────────────────────────────────────
GET    /api/v1/analytics/summary           Overall stats: {total_reviews, avg_score, ...}
GET    /api/v1/analytics/trends            Daily finding counts for last N days
GET    /api/v1/analytics/top-issues        Most frequent finding categories
GET    /api/v1/analytics/agent-performance Agent accuracy, latency, cost metrics
GET    /api/v1/analytics/risk-distribution Finding severity distribution
GET    /api/v1/analytics/repositories      Per-repo comparison stats

# ── Settings ──────────────────────────────────────────────────
GET    /api/v1/settings/models             LLM model configurations
PUT    /api/v1/settings/models             Update model configs (admin only)
GET    /api/v1/settings/agents             Agent enable/disable and config
PUT    /api/v1/settings/agents             Update agent configs
GET    /api/v1/settings/system             System status and health

# ── Auth ──────────────────────────────────────────────────────
GET    /api/v1/auth/github/callback        GitHub OAuth callback
POST   /api/v1/auth/logout                 Invalidate session
GET    /api/v1/auth/me                     Current user info
```

---

## ═══════════════════════════════════════════════
## SECTION 9 — DOCKER COMPOSE (COMPLETE)
## ═══════════════════════════════════════════════

```yaml
# infrastructure/docker-compose.yml
version: "3.9"

services:
  # ── PostgreSQL with pgvector ───────────────────
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: pr_sentinel
      POSTGRES_USER: ${POSTGRES_USER:-sentinel}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?required}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-sentinel} -d pr_sentinel"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ── Redis ─────────────────────────────────────
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:?required}
    volumes: [redis_data:/data]
    ports: ["6379:6379"]
    restart: unless-stopped

  # ── ChromaDB ──────────────────────────────────
  chromadb:
    image: chromadb/chroma:0.5.3
    ports: ["8000:8000"]
    volumes: [chroma_data:/chroma/chroma]
    environment:
      ANONYMIZED_TELEMETRY: "false"
      CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER: ""
    restart: unless-stopped

  # ── Backend API ───────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-sentinel}:${POSTGRES_PASSWORD}@postgres:5432/pr_sentinel
      SYNC_DATABASE_URL: postgresql://${POSTGRES_USER:-sentinel}:${POSTGRES_PASSWORD}@postgres:5432/pr_sentinel
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      CHROMADB_URL: http://chromadb:8000
      GROQ_API_KEY: ${GROQ_API_KEY}
      OLLAMA_BASE_URL: ${OLLAMA_BASE_URL:-""}
      GITHUB_APP_ID: ${GITHUB_APP_ID}
      GITHUB_APP_PRIVATE_KEY: ${GITHUB_APP_PRIVATE_KEY}
      GITHUB_WEBHOOK_SECRET: ${GITHUB_WEBHOOK_SECRET}
      SECRET_KEY: ${SECRET_KEY:?required}
      LANGFUSE_PUBLIC_KEY: ${LANGFUSE_PUBLIC_KEY:-""}
      LANGFUSE_SECRET_KEY: ${LANGFUSE_SECRET_KEY:-""}
      LANGFUSE_HOST: http://langfuse:3000
    ports: ["8001:8001"]
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_started}
      chromadb: {condition: service_started}
    volumes: [./backend:/app]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
    restart: unless-stopped

  # ── Celery Worker ─────────────────────────────
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-sentinel}:${POSTGRES_PASSWORD}@postgres:5432/pr_sentinel
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      CHROMADB_URL: http://chromadb:8000
      GROQ_API_KEY: ${GROQ_API_KEY}
      GITHUB_APP_ID: ${GITHUB_APP_ID}
      GITHUB_APP_PRIVATE_KEY: ${GITHUB_APP_PRIVATE_KEY}
    depends_on: [redis, postgres]
    volumes: [./backend:/app]
    command: celery -A app.workers.celery_app worker --loglevel=info --concurrency=2 -Q review_queue
    restart: unless-stopped

  # ── Celery Flower (monitoring) ─────────────────
  flower:
    image: mher/flower:2.0
    environment:
      CELERY_BROKER_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
    ports: ["5555:5555"]
    depends_on: [redis]

  # ── Frontend ──────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8001
      NEXT_PUBLIC_WS_URL: ws://localhost:8001
    ports: ["3000:3000"]
    volumes: [./frontend/src:/app/src]
    depends_on: [backend]
    restart: unless-stopped

  # ── LangFuse (LLM observability) ──────────────
  langfuse:
    image: langfuse/langfuse:2
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-sentinel}:${POSTGRES_PASSWORD}@postgres:5432/langfuse
      NEXTAUTH_SECRET: ${LANGFUSE_NEXTAUTH_SECRET:?required}
      NEXTAUTH_URL: http://localhost:3001
      SALT: ${LANGFUSE_SALT:?required}
    ports: ["3001:3000"]
    depends_on:
      postgres: {condition: service_healthy}

  # ── Nginx reverse proxy ───────────────────────
  nginx:
    image: nginx:1.25-alpine
    ports: ["80:80"]
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [backend, frontend]
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  chroma_data:
```

---

## ═══════════════════════════════════════════════
## SECTION 10 — ENVIRONMENT VARIABLES
## ═══════════════════════════════════════════════

```bash
# .env.example — copy to .env and fill in values

# ── Database ─────────────────────────────────────
POSTGRES_USER=sentinel
POSTGRES_PASSWORD=change_this_strong_password
POSTGRES_DB=pr_sentinel

# ── Redis ────────────────────────────────────────
REDIS_PASSWORD=change_this_redis_password

# ── LLM Backend (choose at least one) ────────────
# Option A: Groq (FREE — sign up at console.groq.com)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Option B: Ollama (FREE, local — install from ollama.ai)
# OLLAMA_BASE_URL=http://host.docker.internal:11434

# Option C: Together AI (FREE $25 credit)
# TOGETHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── GitHub Integration ────────────────────────────
# Create a GitHub App at: github.com/settings/apps/new
# Required permissions: Pull Requests (Read & Write), Repository Contents (Read)
# Required events: Pull Request
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEo..."
# OR path to .pem file:
# GITHUB_APP_PRIVATE_KEY_PATH=./keys/github-app.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Application Security ──────────────────────────
SECRET_KEY=generate_with_openssl_rand_hex_32
ENCRYPTION_KEY=generate_with_python_fernet_generate_key

# ── LangFuse (open source LLM observability) ─────
# Self-hosted (included in docker-compose) OR use cloud.langfuse.com (free tier)
LANGFUSE_PUBLIC_KEY=pk-lf-xxxxxxxxxxxxxxxxxxxx
LANGFUSE_SECRET_KEY=sk-lf-xxxxxxxxxxxxxxxxxxxx
LANGFUSE_NEXTAUTH_SECRET=generate_with_openssl_rand_hex_32
LANGFUSE_SALT=generate_with_openssl_rand_hex_32

# ── Feature Flags ─────────────────────────────────
ENABLE_LEARNING=true           # Enable feedback-based learning
ENABLE_VECTOR_SEARCH=true      # Enable finding similarity search
MAX_DIFF_SIZE_CHARS=50000      # Max PR diff size to process
DEFAULT_TOKEN_BUDGET=50000     # Token budget per review
REVIEW_TIMEOUT_SECONDS=300     # Max time before review is marked failed
```

---

## ═══════════════════════════════════════════════
## SECTION 11 — IMPLEMENTATION PHASES
## ═══════════════════════════════════════════════

Work through these phases strictly in order. Do NOT jump ahead.

### PHASE 1 — Foundation (Start Here)
1. Create project folder structure (exactly as defined in Section 6)
2. Write `docker-compose.yml` (Section 9) and verify all services start
3. Set up FastAPI `main.py` with health check at `GET /health`
4. Configure `app/config.py` using Pydantic `BaseSettings` (reads .env)
5. Set up `database.py` with async SQLAlchemy engine and session factory
6. Run all Alembic migrations from Section 7 SQL
7. Verify: `docker compose up` → all services healthy → GET /health → 200 OK

### PHASE 2 — AgentScope + LLM
8. Write `agentscope_init.py` from Section 4 code
9. Write a test script: instantiate OrchestratorAgent, send a mock Msg, verify JSON response
10. Wire `init_agentscope()` into FastAPI `lifespan` event
11. Verify: agent receives a PR diff string and returns valid orchestration plan JSON
12. Write unit tests for all agents using mock LLM responses

### PHASE 3 — All Agents
13. Implement `base.py` (PRReviewAgentBase with common reply() structure)
14. Implement all 7 agents (orchestrator → security → performance → quality → test → doc → dep → aggregator)
15. Each agent: implement, write unit test with fixture diff, verify JSON output schema
16. Implement `review_pipeline.py` — runs all agents in parallel, returns aggregated result

### PHASE 4 — GitHub Integration
17. Write `github_service.py` — GitHub App JWT auth, installation tokens, PR diff fetching
18. Write `github_signature.py` — HMAC-SHA256 webhook verification
19. Implement `POST /webhooks/github` — verify signature, parse event, enqueue Celery task
20. Implement Celery task `process_pr_review` — fetch diff, run pipeline, store results
21. Implement `notification_service.py` — post formatted review comments to GitHub PR

### PHASE 5 — REST API
22. Implement all routes from Section 8
23. Add WebSocket endpoint for live streaming agent progress
24. Add authentication with GitHub OAuth (NextAuth.js on frontend, JWT on backend)
25. Add rate limiting (slowapi) and input validation

### PHASE 6 — Frontend
26. Initialize Next.js 14 with App Router, TypeScript, TailwindCSS, shadcn/ui
27. Generate shadcn components: `npx shadcn-ui@latest init`
28. Build layout: Sidebar + Header + PageContainer
29. Build Dashboard page: StatsCards + TrendChart + RecentReviews
30. Build Reviews list page with filters
31. Build Review detail page with AgentStatusBar + FindingsPanel + DiffViewer
32. Add WebSocket real-time updates to review detail
33. Build Repositories page and Repository settings page
34. Build Analytics page with Recharts

### PHASE 7 — Enterprise Hardening
35. Add LangFuse tracing (wrap all LLM calls)
36. Add ChromaDB embeddings for finding deduplication
37. Implement review policies (per-repo agent enable/disable)
38. Add Prometheus metrics endpoint
39. Implement feedback learning (mark accepted/rejected findings)
40. Load testing: use Locust to test pipeline under concurrent PR events
41. Add GitHub Actions CI workflow

---

## ═══════════════════════════════════════════════
## SECTION 12 — CRITICAL IMPLEMENTATION NOTES
## ═══════════════════════════════════════════════

1. **AGENTSCOPE PARALLELISM**: AgentScope agents are synchronous by default.
   Use `asyncio.gather()` with `loop.run_in_executor(None, agent, msg)` to run
   multiple agents truly in parallel. Without this, agents run sequentially
   and a review takes 5–7x longer.

2. **DIFF SIZE MANAGEMENT**: Many PRs exceed model context limits. Always chunk
   large diffs: if diff > 8000 tokens, split by file, process each file separately,
   merge findings. Never silently truncate diffs — log a warning.

3. **GITHUB APP vs PAT**: Use GitHub App authentication, not Personal Access Tokens.
   GitHub Apps use JWT + installation tokens. Tokens expire in 1 hour — implement
   automatic refresh. Store the private key as a multi-line env var, not a file.

4. **WEBHOOK SECURITY**: The GitHub webhook handler MUST verify the X-Hub-Signature-256
   header using HMAC-SHA256 before processing ANY webhook. Return 401 without processing
   on verification failure. Never skip this in any environment.

5. **AGENT ISOLATION**: If one agent raises an exception, the review pipeline must
   continue with all other agents. Use try/except per agent, mark that agent_run
   as "failed", and proceed. Never let one agent failure abort an entire review.

6. **TOKEN BUDGET**: Track token usage per agent and per review. If cumulative
   prompt tokens > `DEFAULT_TOKEN_BUDGET`, skip remaining agents and log a warning.
   This prevents runaway LLM costs under free tier rate limits.

7. **GROQ RATE LIMITS**: Groq free tier is 30 requests/min and 14,400 req/day.
   With 7 agents × ~3 LLM calls each = ~21 calls per review. Implement exponential
   backoff with jitter. Consider queuing reviews to stay within rate limits.

8. **CELERY TASK IDEMPOTENCY**: The `process_pr_review` Celery task must be
   idempotent. On retry, check if a review already exists for (repository_id,
   pr_number, head_sha) and skip re-processing if status is "completed".

9. **FINDING DEDUPLICATION**: Use ChromaDB + sentence-transformers to create
   embeddings of all finding descriptions. Before storing a new finding, check
   if a finding with >0.88 cosine similarity exists in this review. If yes, mark
   as duplicate and link `duplicate_of` to the original.

10. **WEBSOCKET DESIGN**: The `/reviews/{id}/stream` WebSocket broadcasts agent
    status changes (pending → running → completed) and individual findings as they
    arrive. Use Redis pub/sub as the backend for broadcasting from Celery workers
    to multiple WebSocket connections on potentially different server instances.
```
