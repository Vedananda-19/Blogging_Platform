from fastapi import APIRouter
from database import db_dependency
from services import user_service

user_router = APIRouter(prefix="/user", tags=["user"])
