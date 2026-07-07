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
    # Python-side default: stores microsecond precision so the value matches
    # SQLAlchemy's bind format during keyset (cursor) comparisons. func.now()
    # stores only second precision, which breaks the boundary comparison.
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
# (important and useful when sending data from frontend)


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
    author: str

    @field_validator("author", mode="before")
    @classmethod
    def author_username(cls, value):
        return value.username

    @field_serializer("created_at", "updated_at")
    def as_utc(self, dt: datetime) -> str:
        # Stored value is naive UTC (SQLite drops tzinfo); stamp +00:00 so the
        # client can parse it unambiguously instead of treating it as local time.
        return dt.replace(tzinfo=timezone.utc).isoformat()


class PaginatedBlogs(BaseModel):
    blogs: list[BlogOut]
    total_count: int
    # NOTE: next_cursor stays naive on purpose — it round-trips back as the
    # `cursor` query param and must match the naive stored created_at.
    next_cursor: datetime | None = None
    hasMore: bool

