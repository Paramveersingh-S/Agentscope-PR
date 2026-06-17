from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
import uuid
from app.models.base import Base
from sqlalchemy.orm import relationship

class Finding(Base):
    __tablename__ = "findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    review_id = Column(UUID(as_uuid=True), ForeignKey("pr_reviews.id", ondelete="CASCADE"))
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="SET NULL"))
    agent_name = Column(String(100), nullable=False)
    finding_id_label = Column(String(50))
    category = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    title = Column(String(512), nullable=False)
    description = Column(Text)
    recommendation = Column(Text)
    file_path = Column(String(1024))
    line_start = Column(Integer)
    line_end = Column(Integer)
    code_snippet = Column(Text)
    reference = Column(String(255))
    owasp_category = Column(String(50))
    is_duplicate = Column(Boolean, default=False)
    duplicate_of = Column(UUID(as_uuid=True), ForeignKey("findings.id", ondelete="SET NULL"))
    user_feedback = Column(String(20))
    is_false_positive = Column(Boolean, default=False)
    embedding = Column(Vector(384))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    review = relationship("PRReview", back_populates="findings")
