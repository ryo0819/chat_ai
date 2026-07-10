from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="新しいチャット", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    messages = relationship("MessageModel", back_populates="session", cascade="all, delete-orphan")

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" or "model"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("SessionModel", back_populates="messages")
