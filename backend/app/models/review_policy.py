from sqlalchemy import Column, String, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class ReviewPolicy(Base):
    __tablename__ = "review_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    agents_enabled = Column(JSON, default=["security", "performance", "code_quality", "test_coverage"])
    severity_thresholds = Column(JSON, default={"block_on": ["CRITICAL"], "warn_on": ["HIGH"]})
    custom_rules = Column(JSON, default=[])
    max_diff_size_chars = Column(Integer, default=50000)
    token_budget = Column(Integer, default=50000)
    is_default = Column(Boolean, default=False)
