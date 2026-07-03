from sqlalchemy.orm import Session
from models import (
    CreateBlogModel,
    CurrentUser,
    Blogs,
    BlogOut,
    PaginatedBlogs,
    BlogLikes,
)
from fastapi import HTTPException


def create_blog(blogData: CreateBlogModel, db: Session, user: CurrentUser):
    if not blogData.title or not blogData.content:
        raise HTTPException(400, "Fields are Required")
    blog = Blogs(title=blogData.title, content=blogData.content, user_id=user.user_id)
    db.add(blog)
    db.commit()
    return {"message": "Blog Added Successfully"}


def get_blogs(page: int, limit: int, db: Session):
    all_blogs_query = db.query(Blogs)
    total_blogs = all_blogs_query.count()
    blogs = all_blogs_query.offset((page - 1) * limit).limit(limit).all()

    p = total_blogs // limit
    pages = p + 1 if total_blogs and total_blogs % limit != 0 else p

    return PaginatedBlogs(
        page=page,
        page_count=pages,
        blogs=[BlogOut.model_validate(blog) for blog in blogs],
    )


def like_blog(blog_id: int, db: Session, user: CurrentUser):
    like_status = db.get(BlogLikes, (blog_id, user.user_id))
    blog = db.get(Blogs, blog_id)
    if like_status:
        if like_status.type == "liked":
            db.delete(like_status)
            blog.liked_count -= 1
            db.commit()
            return {"message": "Blog Like Status Removed"}
        elif like_status == "disliked":
            like_status.type == "liked"
            blog.liked_count += 1
            blog.disliked_count -= 1
            db.commit()
            return {"message": "Liked Blog"}
    else:
        blog_like = BlogLikes(blog_id=blog_id, user_id=user.user_id, type="liked")
        blog.liked_count += 1
        db.add(blog_like)
        db.commit()
        return {"message": "Liked Blog"}


def dislike_blog(blog_id: int, db: Session, user: CurrentUser):
    dislike_status = db.get(BlogLikes, (blog_id, user.user_id))
    blog = db.get(Blogs, blog_id)
    if dislike_status:
        if dislike_status.type == "liked":
            dislike_status.type = "disliked"
            blog.disliked_count -= 1
            db.commit()
            return {"message": "Disliked Blog"}
        elif dislike_status.type == "disliked":
            db.delete(dislike_status)
            blog.liked_count += 1
            blog.disliked_count -= 1
            db.commit()
            return {"message": "Blog Dislike Status Removed"}
    else:
        blog_dislike = BlogLikes(blog_id=blog_id, user_id=user.user_id, type="disliked")
        blog.disliked_count += 1
        db.add(blog_dislike)
        db.commit()
        return {"message": "Disliked Blog"}
