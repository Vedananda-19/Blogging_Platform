from fastapi import Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from models import RegisterModel, CurrentUser, Users, RefreshTokens
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from database import db_dependency
from jose import jwt, JWTError, ExpiredSignatureError
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import hashlib, hmac
import os

load_dotenv()
OAuth2Scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def register_user(formData: RegisterModel, db: Session):
    if formData.password != formData.confirmPassword:
        raise HTTPException(400, "Passwords Dont match")
    existing_user = db.query(Users).filter(Users.username == formData.username).first()
    if existing_user:
        raise HTTPException(400, "Username Already Exists")

    hashed_password = pwd_context.hash(formData.password)

    new_user = Users(
        username=formData.username, password=hashed_password, auth_provider="local"
    )
    db.add(new_user)
    db.commit()

    return {"message": "User Registered Successfully"}


def get_usernames_list(db: Session) -> list[str]:
    return [row[0] for row in db.query(Users.username).all()]


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(user: Users):
    expiry = datetime.now(timezone.utc) + timedelta(minutes=1)
    encode_data = {"id": user.id, "sub": user.username, "exp": expiry}
    token: str = jwt.encode(encode_data, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}


def create_refresh_token(user: Users, db: Session, device: str):
    expiry = datetime.now(timezone.utc) + timedelta(days=30)
    encode_data = {"id": user.id, "sub": user.username, "exp": expiry}
    token: str = jwt.encode(encode_data, JWT_SECRET_KEY, algorithm=ALGORITHM)

    hashed_token = hash_token(token)
    db.query(RefreshTokens).filter(
        RefreshTokens.user_id == user.id, RefreshTokens.device == device
    ).delete()  # One token per device
    new_refresh_token = RefreshTokens(
        token=hashed_token, device=device, user_id=user.id
    )
    db.add(new_refresh_token)
    db.commit()
    return token


def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        "refresh_token",
        token,
        httponly=True,
        samesite="none",
        secure=True,
        path="/auth",
        max_age=30 * 24 * 60 * 60,
    )


def verify_login(
    username: str, password: str, db: Session, response: Response, device: str
):
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        raise HTTPException(400, "Username does not exist")
    if not pwd_context.verify(password, user.password):
        raise HTTPException(400, "Invalid Credentials")

    refresh_token = create_refresh_token(user, db, device)
    set_refresh_cookie(response, refresh_token)
    return create_access_token(user)


def verify_token(db: db_dependency, token: str = Depends(OAuth2Scheme)) -> CurrentUser:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        username = payload.get("sub")
        if user_id is None:
            raise HTTPException(401, "Unauthorized")
        return CurrentUser(user_id=user_id, username=username)
    except ExpiredSignatureError:
        raise HTTPException(401, "Expired Token")
    except JWTError:
        raise HTTPException(401, "Unauthorized")


def get_current_user(user: CurrentUser = Depends(verify_token)):
    return user


def verify_refresh_token(refresh_token: str, user_id: str, db: Session, device: str):
    stored = (
        db.query(RefreshTokens)
        .filter(RefreshTokens.user_id == user_id, RefreshTokens.device == device)
        .first()
    )
    if stored is None:
        return False
    return hmac.compare_digest(hash_token(refresh_token), stored.token)


def refresh_expired_token(
    refresh_token: str, db: Session, response: Response, device: str
):
    if not refresh_token:
        raise HTTPException(401, "Unauthorized")
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Unauthorized")

    user_id = payload.get("id")
    if not verify_refresh_token(refresh_token, user_id, db, device):
        raise HTTPException(401, "Unauthorized")

    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(401, "Unauthorized")

    new_refresh_token = create_refresh_token(user, db, device)
    set_refresh_cookie(response, new_refresh_token)
    return create_access_token(user)


def logout_user(refresh_token: str, db: Session, response: Response, device: str):
    response.delete_cookie("refresh_token", path="/auth", samesite="none", secure=True)
    if not refresh_token:
        return {"message": "Logged Out Successfully"}
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        db.query(RefreshTokens).filter(
            RefreshTokens.user_id == payload.get("id"), RefreshTokens.device == device
        ).delete()
        db.commit()
    except JWTError:
        pass
    return {"message": "Logged Out Successfully"}


def create_google_user(db: Session, google_id: str, email: str, username: str):
    usernames_set = set(get_usernames_list(db))
    new_username = username
    i = 1
    while new_username in usernames_set:
        new_username = f"{username}{i}"
        i += 1
    new_user = Users(
        username=new_username, email=email, google_id=google_id, auth_provider="google"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def login_with_google(response: Response, google_token: str, db: Session, device: str):
    try:
        id_info = id_token.verify_oauth2_token(
            google_token, requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google Token")
    google_id = id_info["sub"]
    email: str = id_info.get("email")
    username = id_info.get("name") or email.split("@")[0]

    user = db.query(Users).filter(Users.google_id == google_id).first()
    if not user:
        user = create_google_user(db, google_id, email, username)

    new_refresh_token = create_refresh_token(user, db, device)
    set_refresh_cookie(response, new_refresh_token)
    return create_access_token(user)
