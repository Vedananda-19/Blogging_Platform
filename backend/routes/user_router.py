from fastapi import APIRouter, Depends
from database import db_dependency
from models import CurrentUser, BlogOut, EditProfileModel, UserDetailsOut
from services import user_service
from services.auth_service import get_current_user
from typing import Annotated

user_router = APIRouter(prefix="/user", tags=["user"])
user_dependency = Annotated[CurrentUser, Depends(get_current_user)]


@user_router.get("/details/{user_id}", response_model=UserDetailsOut)
def user_details(user_id: str, db: db_dependency):
    return user_service.get_user_details(user_id, db)


@user_router.get("/blogs", response_model=list[BlogOut])
def user_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_user_blogs(db, user)


@user_router.put("/edit-profile")
def edit_profile(
    data: EditProfileModel, db: db_dependency, user: user_dependency
):
    return user_service.edit_profile(data.username, data.photo_url, db, user)


@user_router.get("/liked-blogs", response_model=list[BlogOut])
def liked_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_liked_blogs(db, user)


@user_router.get("/saved-blogs", response_model=list[BlogOut])
def saved_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_saved_blogs(db, user)


@user_router.get("/commented-blogs", response_model=list[BlogOut])
def commented_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_commented_blogs(db, user)


@user_router.get("/liked")
def liked_blog_ids(db: db_dependency, user: user_dependency):
    return user_service.get_liked_blog_ids(db, user)


@user_router.get("/disliked")
def disliked_blog_ids(db: db_dependency, user: user_dependency):
    return user_service.get_disliked_blog_ids(db, user)


@user_router.get("/saved")
def saved_blog_ids(db: db_dependency, user: user_dependency):
    return user_service.get_saved_blog_ids(db, user)


@user_router.get("/commented")
def commented_blog_ids(db: db_dependency, user: user_dependency):
    return user_service.get_commented_blog_ids(db, user)


@user_router.get("/following")
def following(db: db_dependency, user: user_dependency):
    return user_service.get_following_ids(db, user)


@user_router.get("/top")
def top_users(db: db_dependency, user: user_dependency):
    return user_service.get_top_users(db)


@user_router.get("/liked-comments")
def liked_comments(db: db_dependency, user: user_dependency):
    return user_service.get_liked_comment_ids(db, user)

@user_router.post("/follow/{author_id}")
def follow(author_id: str, db: db_dependency, user: user_dependency):
    return user_service.follow(author_id, db, user)
