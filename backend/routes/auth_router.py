from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from database import db_dependency
from models import RegisterModel, CurrentUser, GoogleToken
from services import auth_service

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login")
def login(request: Request,response: Response,db:db_dependency,formData: OAuth2PasswordRequestForm = Depends()): # For Swagger Docs
    ua_string = request.headers.get("User-Agent")#For narrowing the device type , for separate refresh tokens in different devices
    return auth_service.verify_login(formData.username, formData.password, db, response, device=ua_string)

@auth_router.post("/register")
def register(formData: RegisterModel, db:db_dependency):
    return auth_service.register_user(formData, db)

@auth_router.get("/me")
def me(user: CurrentUser = Depends(auth_service.get_current_user)):
    return user

@auth_router.get("/get-users")
def get_users(db: db_dependency):
    return auth_service.get_usernames_list(db)

@auth_router.get("/refresh")
def get_new_token(request:Request, response: Response, db: db_dependency):
    ua_string = request.headers.get("User-Agent")
    refresh_token = request.cookies.get("refresh_token")
    return auth_service.refresh_expired_token(refresh_token, db, response, device=ua_string)

@auth_router.post("/logout")
def logout(request:Request, response: Response, db: db_dependency):
    ua_string = request.headers.get("User-Agent")
    refresh_token = request.cookies.get("refresh_token")
    return auth_service.logout_user(refresh_token, db, response, device=ua_string)

@auth_router.post("/google")
def google_verification(response:Response,request:Request,body:GoogleToken,db: db_dependency):
    ua_string = request.headers.get("User-Agent")
    return auth_service.login_with_google(response,body.google_token,db,device=ua_string)
