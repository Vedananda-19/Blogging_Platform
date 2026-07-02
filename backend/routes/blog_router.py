from fastapi import APIRouter, Depends
from database import db_dependency
from models import CreateBlogModel, CurrentUser
from services import blog_service
from services.auth_service import get_current_user

blog_router = APIRouter(prefix="/blog", tags=["blog"])

@blog_router.post("/create")
def create_blog(blogData: CreateBlogModel, db: db_dependency, user: CurrentUser = Depends(get_current_user)):
    return blog_service.create_blog(blogData, db, user)
