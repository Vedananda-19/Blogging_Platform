from fastapi import APIRouter, Depends
from database import db_dependency
from models import CreateBlogModel, CurrentUser, PaginatedBlogs
from services import blog_service
from services.auth_service import get_current_user
from typing import Annotated

blog_router = APIRouter(prefix="/blog", tags=["blog"])
user_dependency = Annotated[CurrentUser, Depends(get_current_user)]


@blog_router.post("/create")
def create_blog(blogData: CreateBlogModel, db: db_dependency, user: user_dependency):
    return blog_service.create_blog(blogData, db, user)


@blog_router.get("/blogs", response_model=PaginatedBlogs)
def get_blogs(db: db_dependency, page: int = 1, limit: int = 10):
    return blog_service.get_blogs(page, limit, db)


@blog_router.post("/like/{blog_id}")
def like_blog(blog_id: str, db: db_dependency, user: user_dependency):
    return blog_service.like_blog(blog_id, db, user)

@blog_router.post("/dislike/{blog_id}")
def dislike_blog(blog_id: str, db: db_dependency, user: user_dependency):
    return blog_service.dislike_blog(blog_id, db, user)
