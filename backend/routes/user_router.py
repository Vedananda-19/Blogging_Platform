from fastapi import APIRouter, Depends
from database import db_dependency
from models import CurrentUser, BlogOut, EditProfileModel
from services import user_service
from services.auth_service import get_current_user
from typing import Annotated

user_router = APIRouter(prefix="/user", tags=["user"])
user_dependency = Annotated[CurrentUser, Depends(get_current_user)]


@user_router.get("/blogs", response_model=list[BlogOut])
def user_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_user_blogs(db, user)


@user_router.put("/edit-profile")
def edit_profile(
    data: EditProfileModel, db: db_dependency, user: user_dependency
):
    return user_service.edit_profile(data.username, data.photo_url, db, user)


@user_router.get("/liked-blogs", response_model=list[BlogOut])
def liked_blogs_full(db: db_dependency, user: user_dependency):
    return user_service.get_liked_blogs_full(db, user)


@user_router.get("/saved-blogs", response_model=list[BlogOut])
def saved_blogs_full(db: db_dependency, user: user_dependency):
    return user_service.get_saved_blogs_full(db, user)


@user_router.get("/commented-blogs", response_model=list[BlogOut])
def commented_blogs_full(db: db_dependency, user: user_dependency):
    return user_service.get_commented_blogs_full(db, user)


@user_router.get("/liked")
def liked_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_liked_blogs(db, user)


@user_router.get("/disliked")
def disliked_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_disliked_blogs(db, user)


@user_router.get("/saved")
def saved_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_saved_blogs(db, user)


@user_router.get("/commented")
def commented_blogs(db: db_dependency, user: user_dependency):
    return user_service.get_commented_blogs(db, user)
