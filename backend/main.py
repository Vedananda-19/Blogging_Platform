from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from database import Base, engine
from routes.auth_router import auth_router
from routes.blog_router import blog_router
from routes.user_router import user_router
import cloudinary

load_dotenv()

Base.metadata.create_all(bind=engine)

allowed_origins = ["http://localhost:5173", "https://blogging-platform-olive.vercel.app"]

async def lifespan(app:FastAPI):
    cloudinary.config(
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key = os.getenv("CLOUDINARY_API_KEY"),
        api_secret = os.getenv("CLOUDINARY_API_SECRET"),
        secure = True
    )
    yield

app = FastAPI(lifespan=lifespan)
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


@app.get("/health")
def health():
    return {"status": "ok"}
