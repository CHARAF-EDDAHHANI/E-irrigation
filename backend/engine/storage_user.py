"""
storage_user.py
_______________
Storage layer — User CRUD on Supabase PostgreSQL (SQLAlchemy)

Public function signatures identical to JSON version — routes never change.
"""

from typing import Optional, List
from engine.extensions import db
from engine.db_user import UserDB
from models.user import User


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _to_user(row: UserDB) -> User:
    """Convert SQLAlchemy row → User model object."""
    return User.from_dict(row.to_dict(hide_password=False))


# ── CREATE / UPDATE ───────────────────────────────────────────────────────────

def save_user(user: User) -> User:
    """Save or update a user (upsert)."""
    existing = UserDB.query.filter_by(user_id=user.user_id).first()

    if existing:
        existing.fullName   = user.fullName
        existing.email      = user.email
        existing.password   = user.password
        existing.role       = user.role
        existing.phone      = user.phone
        existing.national_id = user.national_id
    else:
        existing = UserDB(
            user_id     = user.user_id,
            fullName    = user.fullName,
            email       = user.email,
            password    = user.password,
            role        = user.role,
            phone       = user.phone,
            national_id = user.national_id,
        )
        db.session.add(existing)

    db.session.commit()
    return user


# ── READ ──────────────────────────────────────────────────────────────────────

def get_all_users() -> List[User]:
    rows = UserDB.query.order_by(UserDB.created_at.desc()).all()
    return [_to_user(row) for row in rows]


def get_user_by_id(user_id: str) -> Optional[User]:
    row = UserDB.query.filter_by(user_id=user_id).first()
    return _to_user(row) if row else None


def get_user_by_email(email: str) -> Optional[User]:
    email = email.lower().strip()
    row = UserDB.query.filter(
        db.func.lower(UserDB.email) == email
    ).first()
    return _to_user(row) if row else None


def get_user_by_phone(phone: str) -> Optional[User]:
    phone = phone.strip()
    row = UserDB.query.filter_by(phone=phone).first()
    return _to_user(row) if row else None


def get_user_by_national_id(national_id: str) -> Optional[User]:
    if not national_id:
        return None
    national_id = national_id.upper().strip()
    row = UserDB.query.filter(
        db.func.upper(UserDB.national_id) == national_id
    ).first()
    return _to_user(row) if row else None


# ── UPDATE ────────────────────────────────────────────────────────────────────

def update_user(user_id: str, **fields) -> Optional[User]:
    row = UserDB.query.filter_by(user_id=user_id).first()
    if not row:
        return None

    user_obj = _to_user(row)
    user_obj.update(**fields)

    updated = user_obj.to_dict(hide_password=False)
    for key, value in updated.items():
        if hasattr(row, key):
            setattr(row, key, value)

    db.session.commit()
    return _to_user(row)


# ── DELETE ────────────────────────────────────────────────────────────────────

def delete_user(user_id: str) -> bool:
    row = UserDB.query.filter_by(user_id=user_id).first()
    if not row:
        return False

    db.session.delete(row)
    db.session.commit()
    return True