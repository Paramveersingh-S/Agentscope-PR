from sqlalchemy import Column, String, Integer, BigInteger, Boolean, JSON, Text, Numeric, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base
from sqlalchemy.orm import relationship

class PRReview(Base):
    __tablename__ = "pr_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"))
    pr_number = Column(Integer, nullable=False)
    pr_title = Column(String(512))
    pr_body = Column(Text)
    pr_author = Column(String(255))
    pr_url = Column(Text)
    base_branch = Column(String(255))
    head_branch = Column(String(255))
    head_sha = Column(String(64))
    diff_content = Column(Text)
    diff_stats = Column(JSON)
    status = Column(String(50), default="pending")
    overall_score = Column(Numeric(4, 1))
    risk_level = Column(String(20))
    recommendation = Column(String(50))
    block_merge = Column(Boolean, default=False)
    orchestration_plan = Column(JSON)
    final_summary = Column(Text)
    github_review_id = Column(BigInteger)
    error_message = Column(Text)
    token_usage = Column(JSON)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('repository_id', 'pr_number', 'head_sha', name='uq_pr_review_repo_pr_sha'),
    )
    
    agent_runs = relationship("AgentRun", back_populates="review", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="review", cascade="all, delete-orphan")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    review_id = Column(UUID(as_uuid=True), ForeignKey("pr_reviews.id", ondelete="CASCADE"))
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), default="pending")
    model_used = Column(String(100))
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    latency_ms = Column(Integer)
    raw_output = Column(JSON)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    review = relationship("PRReview", back_populates="agent_runs")
