from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import Base, engine
import models  # registers the tables on Base
from routes.auth_router import auth_router
from routes.blog_router import blog_router
from routes.user_router import user_router

load_dotenv()

Base.metadata.create_all(bind=engine)

allowed_origins = ["http://localhost:5173","https://authentication-frmp.vercel.app"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_credentials=True,
)
app.include_router(auth_router)
app.include_router(blog_router)
app.include_router(user_router)


@app.get("/")
def home():
    return "Home"
