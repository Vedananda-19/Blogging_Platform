# BlogSphere — Connecting Voices

A full-stack blogging platform where people write rich posts, react and discuss, follow their favourite authors, and discover the top voices in the community.

## Live Demo

- **Frontend:** [BlogSphere](https://blogging-platform-olive.vercel.app/)

- **Backend API:** [Swagger Docs](https://blogging-platform-tudc.onrender.com/docs)

---

## Features

- Secure registration & login with JWT + Google Sign-In
- Rich-text blog editor (TipTap) with image uploads
- Create, edit, and delete your own posts (owner-only, enforced server-side)
- Blog feed with Searching, Sorting & Infinite Scroll
- Likes / dislikes, saves, and comments
- Following feed, Dedicated author pages & Top Authors
- Profile with live stats — followers, following, posts, comments
- Cloud image storage (Cloudinary) and persistent PostgreSQL database

## Tech Stack

### Frontend
- React + TypeScript
- TanStack Query
- TipTap rich-text editor
- Firebase (Google OAuth)

<sub>_Note:JSX and Styling was assisted by AI._</sub>

### Backend
- FastAPI
- SQLAlchemy ORM
- python-jose (JWT) + passlib / bcrypt
- Cloudinary (image uploads)

### Database
- PostgreSQL (Neon) in production
- SQLite for local development

### Deployment & Infra
- Frontend — **Vercel**
- Backend — **Render**
- Database — **Neon (PostgreSQL)**
- Images — **Cloudinary**
- Containerised with **Docker & Docker Compose**
- **GitHub Actions** CI (build, health-check, push images to Docker Hub)


## Project Structure

```
Blogging_Platform
├── backend
│   ├── routes
│   │   ├── auth_router.py
│   │   ├── blog_router.py
│   │   └── user_router.py
│   ├── services
│   │   ├── auth_service.py
│   │   ├── blog_service.py
│   │   └── user_service.py
│   ├── database.py
│   ├── models.py
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend
│   ├── public
│   └── src
│       ├── apis          # axios instance + auth/refresh interceptors
│       ├── components    # BlogCard, Navbar, Sidebar, CommentSection, editor, ...
│       ├── config        # Firebase (Google auth) config
│       ├── hooks         # React Query data & mutation hooks
│       ├── layouts       # RootLayout (navbar + sidebar shell)
│       ├── pages         # Blogs, BlogDetail, Author, Profile, Settings, auth, ...
│       ├── App.tsx
│       └── main.tsx
├── compose.yaml
└── .github/workflows/main.yml
```

## API Features

- JWT authentication with **rotating refresh tokens** (single-flight refresh on the client)
- Blog CRUD endpoints with **owner-only** authorization
- Cursor-based pagination, search & sort
- Likes / dislikes / saves / comments + comment likes
- Follow / unfollow, following feed, author details, top users
- Cloudinary image-upload endpoint (authenticated)
- Google OAuth login
- Health check for CI / uptime

## Frontend Features

- Modern responsive interface with navbar + sidebar
- TanStack Query server-state management
- Optimistic UI update for follow
- JWT auth state via TanStack Query
- Infinite scrolling feeds and paginated comments
- Dark / light theme with persistence
- Protected routes
- Modular, reusable components

## Getting Started

### Prerequisites
- Node.js 20+ and Python 3.13+
- A Cloudinary account and a Google OAuth client (for Google Sign-In)

### Backend
```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET_KEY, CLOUDINARY_*, GOOGLE_CLIENT_ID
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.development   # set VITE_API_URL=http://localhost:8000
npm run dev
```

### Or run the whole stack with Docker
```bash
docker compose --env-file backend/.env up --build
```

## What I Learned

- Building production-ready full-stack applications
- Designing REST APIs with FastAPI + SQLAlchemy
- JWT authentication with refresh-token rotation and a single-flight refresh interceptor
- Google OAuth integration
- Cursor-based pagination and infinite queries
- Managing server state and caching with TanStack Query
- Optimistic UI updates
- Cloud image handling with Cloudinary
- Containerising and deploying frontend & backend independently (Vercel + Render)
- Working with Neon PostgreSQL and migrating data
- CI/CD with GitHub Actions and Docker Hub
- Building a scalable, modular project architecture

## Future Improvements

- Followers list & richer author profiles
- Comment editing/deletion and threaded replies
- Notifications (new followers, likes, comments)
- Bookmarks/collections and reading lists
- Full-text search
- Alembic database migrations
- Rate limiting and abuse protection
- Automated test suite

## Author

**Vedananda Pathi**
GitHub: https://github.com/Vedananda-19
