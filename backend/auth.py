import os
import json
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from jose import JWTError, jwt

from db import get_conn
from models import UserCreate, UserLogin, UserResponse

router = APIRouter()

SECRET_KEY = os.environ.get("JWT_SECRET", "change-me-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 30


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> int:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return int(payload["sub"])


def get_current_user(access_token: str = Cookie(None)) -> dict:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user_id = decode_token(access_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    with get_conn() as conn:
        row = conn.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(row)


def _set_auth_cookies(response: Response, user: dict, token: str):
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=TOKEN_EXPIRE_DAYS * 86400)
    response.set_cookie(
        "user_info",
        json.dumps({"id": user["id"], "name": user["name"], "email": user["email"]}),
        httponly=False,
        samesite="lax",
        max_age=TOKEN_EXPIRE_DAYS * 86400,
    )


@router.post("/register", response_model=UserResponse)
def register(body: UserCreate, response: Response):
    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (body.name, body.email, hash_password(body.password)),
        )
        user_id = cursor.lastrowid

    user = {"id": user_id, "name": body.name, "email": body.email}
    token = create_token(user_id)
    _set_auth_cookies(response, user, token)
    return user


@router.post("/login", response_model=UserResponse)
def login(body: UserLogin, response: Response):
    with get_conn() as conn:
        row = conn.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (body.email,)).fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = {"id": row["id"], "name": row["name"], "email": row["email"]}
    token = create_token(row["id"])
    _set_auth_cookies(response, user, token)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("user_info")
    return {"ok": True}


@router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(get_current_user)):
    return current_user
