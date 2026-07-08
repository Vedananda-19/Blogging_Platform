from pydantic import BaseModel, field_validator, field_serializer
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
from datetime import datetime, timezone
import uuid

# Models : Database Models(storing data) , Validation/Input Models, Output Models(for better serialization)

# Database Models - SQL Base tables for storing data


class Users(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True)
    password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    auth_provider = Column(String)
    photo_url = Column(String, nullable=True)
    photo_id = Column(String, nullable=True)

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
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    liked_count = Column(Integer, default=0)
    disliked_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)

    author = relationship("Users", back_populates="blogs")
    likes = relationship("BlogLikes")

    @property
    def author_name(self):
        return self.author.username

    @property
    def profile_picture(self):
        return self.author.photo_url

class BlogSaves(Base):
    __tablename__ = "blog_saves"

    blog_id = Column(String,ForeignKey("blogs.id"),primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)


class BlogLikes(Base):
    __tablename__ = "blog_likes"

    blog_id = Column(String, ForeignKey("blogs.id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    type = Column(String)


class BlogComments(Base):
    __tablename__ = "blog_comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_id = Column(String, ForeignKey("blogs.id"))
    user_id = Column(String, ForeignKey("users.id"))
    comment = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    comment_likes = Column(Integer, default=0)


class CommentLikes(Base):
    __tablename__ = "comment_likes"

    comment_id = Column(String, ForeignKey("blog_comments.id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)


# Validation Models - Pydantic validation models when routes recieve data
# (very useful and almost necessary when sending data to fastapi)


class RegisterModel(BaseModel):
    username: str
    password: str
    confirmPassword: str


class GoogleToken(BaseModel):
    google_token: str


class CreateBlogModel(BaseModel):
    title: str
    content: str


class CreateCommentModel(BaseModel):
    blog_id: str
    comment: str


class CurrentUser(BaseModel):
    user_id: str
    username: str


# Output Models - Pydantic models to validate data sent to client
# (used for better serialization)

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
    author_name: str
    profile_picture: str | None = None

    @field_serializer("created_at", "updated_at")
    def as_utc(self, dt: datetime) -> str:
        return dt.replace(tzinfo=timezone.utc).isoformat()


class PaginatedBlogs(BaseModel):
    blogs: list[BlogOut]
    total_count: int
    next_cursor: datetime | None = None
    hasMore: bool

