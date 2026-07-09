from sqlalchemy.orm import Session
from models import CurrentUser, BlogLikes, BlogSaves, BlogComments


def get_liked_blogs(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogLikes.blog_id)
        .filter(BlogLikes.user_id == user.user_id, BlogLikes.type == "liked")
        .all()
    )
    return [r[0] for r in rows]


def get_disliked_blogs(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogLikes.blog_id)
        .filter(BlogLikes.user_id == user.user_id, BlogLikes.type == "disliked")
        .all()
    )
    return [r[0] for r in rows]


def get_saved_blogs(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogSaves.blog_id)
        .filter(BlogSaves.user_id == user.user_id)
        .all()
    )
    return [r[0] for r in rows]


def get_commented_blogs(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogComments.blog_id)
        .filter(BlogComments.user_id == user.user_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]
