from sqlalchemy import Column, String, BigInteger, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_id = Column(BigInteger, unique=True)
    github_username = Column(String(255), unique=True, nullable=False)
    display_name = Column(String(255))
    email = Column(String(255))
    avatar_url = Column(Text)
    role = Column(String(50), default='member')
    is_active = Column(Boolean, default=True)
    last_login_at = Column(String)
