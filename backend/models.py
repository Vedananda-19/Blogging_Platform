from pydantic import BaseModel, field_validator
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


class RegisterModel(BaseModel):
    username: str
    password: str
    confirmPassword: str


class GoogleToken(BaseModel):
    google_token: str


class CreateBlogModel(BaseModel):
    title: str
    content: str


class BlogOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    liked_count: int
    disliked_count: int
    comment_count: int
    author: str

    @field_validator("author", mode="before")
    @classmethod
    def author_username(cls, value):
        return value.username


class PaginatedBlogs(BaseModel):
    page: int
    page_count: int
    blogs: list[BlogOut]


class CurrentUser(BaseModel):
    user_id: str
    username: str


class Users(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True)
    password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    auth_provider = Column(String)

    blogs = relationship("Blogs", back_populates="author")
    liked_blogs = relationship("BlogLikes")


class RefreshTokens(Base):
    __tablename__ = "refresh_tokens"

    device = Column(String)
    token = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))


class Blogs(Base):
    __tablename__ = "blogs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    content = Column(String)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    liked_count = Column(Integer, default=0)
    disliked_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)

    author = relationship("Users", back_populates="blogs")
    likes = relationship("BlogLikes")


class BlogLikes(Base):
    __tablename__ = "blog_likes"

    blog_id = Column(String, ForeignKey("blogs.id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    type = Column(String)
