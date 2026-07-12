from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import CurrentUser, BlogLikes, BlogSaves, BlogComments, Users, BlogOut


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


def _require_user(db: Session, user: CurrentUser) -> Users:
    db_user = db.get(Users, user.user_id)
    if not db_user:
        raise HTTPException(404, "User not found")
    return db_user


def _blogs_out(blogs) -> list[BlogOut]:
    ordered = sorted(blogs, key=lambda b: b.created_at, reverse=True)
    return [BlogOut.model_validate(b) for b in ordered]


def get_user_blogs(db: Session, user: CurrentUser):
    db_user = _require_user(db, user)
    # Pull straight off the user via the relationship, newest first
    return _blogs_out(db_user.blogs)


def edit_profile(username: str, photo_url: str, db: Session, user: CurrentUser):
    db_user = _require_user(db, user)
    username = username.strip()
    if not username:
        raise HTTPException(400, "Username cannot be empty")
    taken = (
        db.query(Users)
        .filter(Users.username == username, Users.id != user.user_id)
        .first()
    )
    if taken:
        raise HTTPException(400, "Username already taken")
    db_user.username = username
    db_user.photo_url = photo_url
    db.commit()
    return {"message": "Profile updated successfully"}


def get_liked_blogs_full(db: Session, user: CurrentUser):
    db_user = _require_user(db, user)
    return _blogs_out(
        like.blog for like in db_user.liked_blogs if like.type == "liked"
    )


def get_saved_blogs_full(db: Session, user: CurrentUser):
    db_user = _require_user(db, user)
    return _blogs_out(save.blog for save in db_user.saved)


def get_commented_blogs_full(db: Session, user: CurrentUser):
    db_user = _require_user(db, user)
    # A user can comment on the same blog multiple times — de-dupe by blog
    unique = {}
    for c in db_user.comments:
        unique.setdefault(c.blog_id, c.blog)
    return _blogs_out(unique.values())
