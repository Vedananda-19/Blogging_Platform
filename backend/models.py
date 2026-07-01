from pydantic import BaseModel
from sqlalchemy import Column,Integer,String,Boolean,ForeignKey
from database import Base
import uuid


class RegisterModel(BaseModel):
    username: str
    password: str
    confirmPassword: str


class GoogleToken(BaseModel):
    google_token: str


class CurrentUser(BaseModel):
    user_id: str
    username: str

class Users(Base):
    __tablename__="users"

    id = Column(String,primary_key=True,default=lambda:str(uuid.uuid4()))
    username = Column(String,unique=True)
    password = Column(String,nullable=True)
    google_id = Column(String,unique=True,nullable=True)
    email = Column(String,unique=True,nullable=True)
    auth_provider = Column(String)

class RefreshTokens(Base):
    __tablename__="refresh_tokens"

    device = Column(String)
    token = Column(String,primary_key=True)
    user_id = Column(String,ForeignKey("users.id"))
