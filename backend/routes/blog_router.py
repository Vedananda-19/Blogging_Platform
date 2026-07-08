from fastapi import APIRouter, Depends
from database import db_dependency
from models import CreateBlogModel, CurrentUser, PaginatedBlogs, CreateCommentModel, BlogOut
from services import blog_service
from services.auth_service import get_current_user
from datetime import datetime
from typing import Annotated

blog_router = APIRouter(prefix="/blog", tags=["blog"])
user_dependency = Annotated[CurrentUser, Depends(get_current_user)]


@blog_router.post("/create")
def create_blog(blogData: CreateBlogModel, db: db_dependency, user: user_dependency):
    return blog_service.create_blog(blogData, db, user)


@blog_router.get("/blogs", response_model=PaginatedBlogs)
def get_blogs(
    db: db_dependency, cursor: datetime | None = None, limit: int = 10, search: str = "", sort: str = "recent"
):
    return blog_service.get_blogs(cursor, limit, search, sort, db)


@blog_router.post("/like/{blog_id}")
def like_blog(blog_id: str, db: db_dependency, user: user_dependency):
    return blog_service.like_blog(blog_id, db, user)


@blog_router.post("/dislike/{blog_id}")
def dislike_blog(blog_id: str, db: db_dependency, user: user_dependency):
    return blog_service.dislike_blog(blog_id, db, user)

@blog_router.post("/save/{blog_id}")
def save_blog(blog_id: str, db: db_dependency, user: user_dependency):
    return blog_service.save_blog(blog_id, db, user)



@blog_router.post("/comment")
def comment_blog(
    comment_data: CreateCommentModel, db: db_dependency, user: user_dependency
):
    return blog_service.comment_on_blog(
        comment_data.blog_id, comment_data.comment, db, user
    )


@blog_router.post("/like-comment/{comment_id}")
def like_comment(comment_id: str, db: db_dependency, user: user_dependency):
    return blog_service.like_comment(comment_id, db, user)


@blog_router.get("/comments/{blog_id}")
def get_comments(
    blog_id: str,
    db: db_dependency,
    user: user_dependency,
    page: int | None = None,
    limit: int = 20,
):
    return blog_service.get_blog_comments(page, limit, blog_id, db, user)


# Keep this LAST: a single-segment path param would otherwise shadow /blog/blogs etc.
@blog_router.get("/{blog_id}", response_model=BlogOut)
def get_blog(blog_id: str, db: db_dependency):
    return blog_service.get_blog(blog_id, db)
