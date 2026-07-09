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
    CommentOut,
    PaginatedComments,
)
from fastapi import HTTPException, UploadFile
from datetime import datetime
from cloudinary.uploader import upload


def create_blog(blogData: CreateBlogModel, db: Session, user: CurrentUser):
    if not blogData.title or not blogData.content:
        raise HTTPException(400, "Fields are Required")
    blog = Blogs(
        title=blogData.title,
        content=blogData.content,
        cover=blogData.cover,
        user_id=user.user_id,
    )
    db.add(blog)
    db.commit()
    return {"message": "Blog Added Successfully"}


def get_blogs(cursor: datetime | None, limit: int, search: str, sort: str, db: Session):
    # Querying
    blogs_query = db.query(Blogs)

    # Filtering
    blogs_query = blogs_query.filter(
        or_(Blogs.title.ilike(f"%{search}%"), Blogs.content.ilike(f"%{search}%"))
    )

    # Counting
    total_blogs = blogs_query.count()

    # Pagination
    blogs_query = (
        blogs_query.filter(Blogs.created_at < cursor) if cursor else blogs_query
    )

    # Sorting
    if sort == "top":
        blogs_query = blogs_query.order_by(
            (Blogs.liked_count - Blogs.disliked_count).desc()
        )
    else:
        blogs_query = blogs_query.order_by(Blogs.created_at.desc())

    # Limiting
    blogs = blogs_query.limit(limit).all()

    # Getting Next Cursor
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
    if not comment or not comment.strip():
        raise HTTPException(400, "Comment cannot be empty")
    blog = db.get(Blogs, blog_id)
    if not blog:
        raise HTTPException(404, "Blog not found")
    blog_comment = BlogComments(
        blog_id=blog_id, user_id=user.user_id, comment=comment.strip()
    )
    db.add(blog_comment)
    blog.comment_count += 1
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
    page: int, limit: int, blog_id: str, db: Session, sort: str, user: CurrentUser
):
    blog = db.get(Blogs, blog_id)
    if not blog:
        raise HTTPException(404, "Blog not found")

    # Fetch straight off the blog via the relationship instead of re-querying
    comments = list(blog.comments)
    total_count = len(comments)

    if sort == "top":
        comments.sort(key=lambda c: c.comment_likes, reverse=True)
    else:
        comments.sort(key=lambda c: c.created_at, reverse=True)

    start = (page - 1) * limit
    page_items = comments[start : start + limit]

    p = total_count // limit
    pages = p + 1 if total_count and total_count % limit != 0 else p

    return PaginatedComments(
        comments=[CommentOut.model_validate(c) for c in page_items],
        comment_count=total_count,
        page_count=pages,
    )


def get_blog(blog_id: str, db: Session):
    blog = db.get(Blogs, blog_id)
    if not blog:
        raise HTTPException(404, "Blog not found")
    return BlogOut.model_validate(blog)


async def upload_image(file: UploadFile):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "The file should be an image")
    MAX_FILE_MB = 10  # (Cloudinary isnt allowing more)
    contents = await file.read()
    if len(contents) > MAX_FILE_MB*1024*1024:
        raise HTTPException(413, f"File Size must be less than {MAX_FILE_MB}MB")

    result = upload(file.file, folder="blog_images")

    return {"url": result["secure_url"], "public_id": result["public_id"]}
