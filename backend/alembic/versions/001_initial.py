"""initial

Revision ID: 001
Revises: 
Create Date: 2026-06-17 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector;')
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    op.execute("""
CREATE TABLE repositories (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_repo_id              BIGINT UNIQUE NOT NULL,
    full_name                   VARCHAR(255) NOT NULL,
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
    """)

    op.execute("""
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
    diff_stats          JSONB,
    status              VARCHAR(50) DEFAULT 'pending',
    overall_score       DECIMAL(4,1),
    risk_level          VARCHAR(20),
    recommendation      VARCHAR(50),
    block_merge         BOOLEAN DEFAULT false,
    orchestration_plan  JSONB,
    final_summary       TEXT,
    github_review_id    BIGINT,
    error_message       TEXT,
    token_usage         JSONB,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repository_id, pr_number, head_sha)
);
    """)
    op.execute("CREATE INDEX idx_pr_reviews_status ON pr_reviews(status);")
    op.execute("CREATE INDEX idx_pr_reviews_repository ON pr_reviews(repository_id);")
    op.execute("CREATE INDEX idx_pr_reviews_created ON pr_reviews(created_at DESC);")

    op.execute("""
CREATE TABLE agent_runs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id           UUID REFERENCES pr_reviews(id) ON DELETE CASCADE,
    agent_name          VARCHAR(100) NOT NULL,
    status              VARCHAR(50) DEFAULT 'pending',
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
    """)
    op.execute("CREATE INDEX idx_agent_runs_review ON agent_runs(review_id);")

    op.execute("""
CREATE TABLE findings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id           UUID REFERENCES pr_reviews(id) ON DELETE CASCADE,
    agent_run_id        UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    agent_name          VARCHAR(100) NOT NULL,
    finding_id_label    VARCHAR(50),
    category            VARCHAR(100) NOT NULL,
    severity            VARCHAR(20) NOT NULL,
    title               VARCHAR(512) NOT NULL,
    description         TEXT,
    recommendation      TEXT,
    file_path           VARCHAR(1024),
    line_start          INTEGER,
    line_end            INTEGER,
    code_snippet        TEXT,
    reference           VARCHAR(255),
    owasp_category      VARCHAR(50),
    is_duplicate        BOOLEAN DEFAULT false,
    duplicate_of        UUID REFERENCES findings(id) ON DELETE SET NULL,
    user_feedback       VARCHAR(20),
    is_false_positive   BOOLEAN DEFAULT false,
    embedding           VECTOR(1536),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
    """)
    op.execute("CREATE INDEX idx_findings_review ON findings(review_id);")
    op.execute("CREATE INDEX idx_findings_severity ON findings(severity);")
    op.execute("CREATE INDEX idx_findings_agent ON findings(agent_name);")

    op.execute("""
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
    """)

    op.execute("""
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id           BIGINT UNIQUE,
    github_username     VARCHAR(255) UNIQUE NOT NULL,
    display_name        VARCHAR(255),
    email               VARCHAR(255),
    avatar_url          TEXT,
    role                VARCHAR(50) DEFAULT 'member',
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ
);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE users;")
    op.execute("DROP TABLE review_policies;")
    op.execute("DROP TABLE findings;")
    op.execute("DROP TABLE agent_runs;")
    op.execute("DROP TABLE pr_reviews;")
    op.execute("DROP TABLE repositories;")
