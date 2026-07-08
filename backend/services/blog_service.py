from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import (
    CreateBlogModel,
    CurrentUser,
    Blogs,
    BlogOut,
    PaginatedBlogs,
    BlogLikes,
    BlogComments,
    CommentLikes,
    BlogSaves,
)
from fastapi import HTTPException
from datetime import datetime


def create_blog(blogData: CreateBlogModel, db: Session, user: CurrentUser):
    if not blogData.title or not blogData.content:
        raise HTTPException(400, "Fields are Required")
    blog = Blogs(title=blogData.title, content=blogData.content, user_id=user.user_id)
    db.add(blog)
    db.commit()
    return {"message": "Blog Added Successfully"}


def get_blogs(cursor: datetime | None, limit: int, search: str, sort: str, db: Session):

    #Querying
    blogs_query = db.query(Blogs)

    #Filtering
    blogs_query = blogs_query.filter(
        or_(Blogs.title.ilike(f"%{search}%"), Blogs.content.ilike(f"%{search}%"))
    )

    #Counting
    total_blogs = blogs_query.count()

    #Pagination
    blogs_query = (
        blogs_query.filter(Blogs.created_at < cursor) if cursor else blogs_query
    )

    #Sorting
    if sort=="top":
        blogs_query = blogs_query.order_by((Blogs.liked_count-Blogs.disliked_count).desc())
    else:
        blogs_query = blogs_query.order_by(Blogs.created_at.desc())

    #Limiting
    blogs = blogs_query.limit(limit).all()

    #Getting Next Cursor
    next_cursor = blogs[-1].created_at if blogs else None

    return PaginatedBlogs(
        blogs=[BlogOut.model_validate(blog) for blog in blogs],
        total_count=total_blogs,
        hasMore=(len(blogs) == limit),
        next_cursor=next_cursor,
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
        elif like_status.type == "disliked":
            like_status.type = "liked"
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
            blog.disliked_count += 1
            blog.liked_count -= 1
            db.commit()
            return {"message": "Disliked Blog"}
        elif dislike_status.type == "disliked":
            db.delete(dislike_status)
            blog.disliked_count -= 1
            db.commit()
            return {"message": "Blog Dislike Status Removed"}
    else:
        blog_dislike = BlogLikes(blog_id=blog_id, user_id=user.user_id, type="disliked")
        blog.disliked_count += 1
        db.add(blog_dislike)
        db.commit()
        return {"message": "Disliked Blog"}


def save_blog(blog_id: str, db: Session, user: CurrentUser):
    saved = db.get(BlogSaves, (blog_id, user.user_id))
    if saved:
        db.delete(saved)
        db.commit()
        return {"message": "Save status removed"}
    else:
        new_save = BlogSaves(blog_id=blog_id, user_id=user.user_id)
        db.add(new_save)
        db.commit()
    return {"message": "Saved Blog"}


def comment_on_blog(blog_id: str, comment: str, db: Session, user: CurrentUser):
    blog_comment = BlogComments(blog_id=blog_id, user_id=user.user_id, comment=comment)
    db.add(blog_comment)
    db.commit()
    return {"message": "Comment Added Successfully"}


def like_comment(comment_id: str, db: Session, user: CurrentUser):
    like = db.get(CommentLikes, (comment_id, user.user_id))
    comment = db.get(BlogComments, comment_id)
    if like:
        db.delete(like)
        comment.comment_likes += 1
        db.commit()
        return {"message": "Comment Like Status Removed"}
    else:
        new_like = CommentLikes(comment_id=comment_id, user_id=user.user_id)
        db.add(new_like)
        db.commit()
        return {"message": "Comment Liked"}


def get_blog_comments(
    page: int, limit: int, blog_id: str, db: Session, user: CurrentUser
):
    comments_query = db.query(BlogComments).filter(BlogComments.blog_id == blog_id)
    total_count = comments_query.count()
    comments = comments_query.offset((page - 1) * limit).limit(limit).all()

    p = total_count // limit
    pages = p + 1 if total_count and total_count % limit != 0 else p

    return {"comments": comments, "comment_count": total_count, "page_count": pages}


def get_blog(blog_id: str, db: Session):
    blog = db.get(Blogs, blog_id)
    if not blog:
        raise HTTPException(404, "Blog not found")
    return BlogOut.model_validate(blog)
