from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SessionBase(BaseModel):
    title: str

class SessionCreate(BaseModel):
    title: Optional[str] = None

class Session(SessionBase):
    id: int
    created_at: datetime
    messages: List[Message] = []

    class Config:
        from_attributes = True

class SessionList(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True
