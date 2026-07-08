from fastapi import APIRouter, Depends
from database import db_dependency
from models import CurrentUser
from services import user_service
from services.auth_service import get_current_user
from typing import Annotated

user_router = APIRouter(prefix="/user", tags=["user"])
user_dependency = Annotated[CurrentUser, Depends(get_current_user)]


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
