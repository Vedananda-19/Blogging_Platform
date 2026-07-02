from sqlalchemy.orm import Session
from models import CreateBlogModel, CurrentUser, Blogs
from fastapi import HTTPException

def create_blog(blogData: CreateBlogModel, db: Session, user: CurrentUser):
    if not blogData.title or not blogData.content:
        raise HTTPException(400,"Fields are Required")
    blog = Blogs(title=blogData.title,content=blogData.content,user_id=user.user_id)
    db.add(blog)
    db.commit()
    return {"message":"Blog Added Successfully"}
