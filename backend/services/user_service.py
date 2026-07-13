from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from models import CurrentUser, Blogs, BlogLikes, BlogSaves, BlogComments, CommentLikes, Users, BlogOut, Follows


def get_liked_blog_ids(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogLikes.blog_id)
        .filter(BlogLikes.user_id == user.user_id, BlogLikes.type == "liked")
        .all()
    )
    return [r[0] for r in rows]


def get_disliked_blog_ids(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogLikes.blog_id)
        .filter(BlogLikes.user_id == user.user_id, BlogLikes.type == "disliked")
        .all()
    )
    return [r[0] for r in rows]


def get_saved_blog_ids(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogSaves.blog_id)
        .filter(BlogSaves.user_id == user.user_id)
        .all()
    )
    return [r[0] for r in rows]


def get_commented_blog_ids(db: Session, user: CurrentUser):
    rows = (
        db.query(BlogComments.blog_id)
        .filter(BlogComments.user_id == user.user_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]


def get_top_users(db: Session) -> list[str]:
    # score = posts + followers + (total likes received / 5); return top-10 ids.
    rows = (
        db.query(
            Users.id,
            Users.follow_count,
            func.count(Blogs.id),
            func.coalesce(func.sum(Blogs.liked_count), 0),
        )
        .outerjoin(Blogs, Blogs.user_id == Users.id)
        .group_by(Users.id)
        .all()
    )
    scored = [
        (uid, posts + (followers or 0) + likes / 5)
        for uid, followers, posts, likes in rows
    ]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [uid for uid, _ in scored[:10]]


def get_following_ids(db: Session, user: CurrentUser):
    rows = (
        db.query(Follows.author_id)
        .filter(Follows.user_id == user.user_id)
        .all()
    )
    return [r[0] for r in rows]


def get_liked_comment_ids(db: Session, user: CurrentUser):
    rows = (
        db.query(CommentLikes.comment_id)
        .filter(CommentLikes.user_id == user.user_id)
        .all()
    )
    return [r[0] for r in rows]


def get_user_details(user_id: str, db: Session):
    db_user = db.get(Users, user_id)
    if not db_user:
        raise HTTPException(404, "User not found")

    following_author_ids = [
        row[0]
        for row in db.query(Follows.author_id)
        .filter(Follows.user_id == user_id)
        .all()
    ]
    post_count = db.query(Blogs).filter(Blogs.user_id == user_id).count()
    comment_count = (
        db.query(BlogComments).filter(BlogComments.user_id == user_id).count()
    )
    return {
        "user_id": db_user.id,
        "username": db_user.username,
        "photo_url": db_user.photo_url,
        "follow_count": db_user.follow_count or 0,
        "following_count": len(following_author_ids),
        "post_count": post_count,
        "comment_count": comment_count,
        "following_author_ids": following_author_ids,
    }


def require_user(db: Session, user: CurrentUser) -> Users:
    db_user = db.get(Users, user.user_id)
    if not db_user:
        raise HTTPException(404, "User not found")
    return db_user


def blogs_out(blogs) -> list[BlogOut]:
    ordered = sorted(blogs, key=lambda b: b.created_at, reverse=True)
    return [BlogOut.model_validate(b) for b in ordered]


def get_user_blogs(db: Session, user: CurrentUser):
    db_user = require_user(db, user)
    return blogs_out(db_user.blogs)


def edit_profile(username: str, photo_url: str, db: Session, user: CurrentUser):
    db_user = require_user(db, user)
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


def get_liked_blogs(db: Session, user: CurrentUser):
    db_user = require_user(db, user)
    return blogs_out(
        like.blog for like in db_user.liked_blogs if like.type == "liked"
    )


def get_saved_blogs(db: Session, user: CurrentUser):
    db_user = require_user(db, user)
    return blogs_out(save.blog for save in db_user.saved)


def get_commented_blogs(db: Session, user: CurrentUser):
    db_user = require_user(db, user)
    unique = {}
    for c in db_user.comments:
        unique.setdefault(c.blog_id, c.blog)
    return blogs_out(unique.values())

def follow(author_id: str, db: Session, user: CurrentUser):
    if author_id == user.user_id:
        raise HTTPException(400, "You cannot follow yourself")
    author = db.get(Users, author_id)
    if not author:
        raise HTTPException(404, "User not found")

    follow_status = db.get(Follows, (user.user_id, author_id))
    if follow_status:
        db.delete(follow_status)
        author.follow_count -= 1
        db.commit()
        return {"message": "Unfollowed Successfully"}
    else:
        db.add(Follows(user_id=user.user_id, author_id=author_id))
        author.follow_count += 1
        db.commit()
        return {"message": "Followed Successfully"}
