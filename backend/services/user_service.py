from sqlalchemy.orm import Session
from models import CurrentUser, BlogLikes, BlogSaves, BlogComments


def get_liked_blogs(db: Session, user: CurrentUser):
    blogs = (
        db.query(BlogLikes.blog_id)
        .filter(BlogLikes.user_id == user.user_id, BlogLikes.type == "liked")
        .all()
    )
    return blogs


def get_disliked_blogs(db: Session, user: CurrentUser):
    blogs = (
        db.query(BlogLikes.blog_id)
        .filter(BlogLikes.user_id == user.user_id, BlogLikes.type == "disliked")
        .all()
    )
    return blogs


def get_saved_blogs(db: Session, user: CurrentUser):
    blogs = db.query(BlogSaves.blog_id).filter(BlogSaves.user_id == user.user_id).all()
    return blogs


def get_commented_blogs(db: Session, user: CurrentUser):
    blogs = (
        db.query(BlogComments.blog_id)
        .filter(BlogComments.user_id == user.user_id)
        .distinct()
        .all()
    )
    return blogs
