from sqlalchemy import Column, String, BigInteger, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_repo_id = Column(BigInteger, unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    display_name = Column(String(255))
    description = Column(String)
    default_branch = Column(String(255), default='main')
    github_app_installation_id = Column(BigInteger)
    webhook_secret = Column(String(255))
    is_active = Column(Boolean, default=True)
    review_config = Column(JSON, default={"auto_review": True, "block_on_critical": True})
