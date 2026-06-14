"""
storage_conception.py
_____________________
Storage layer — Conception CRUD on Supabase PostgreSQL (SQLAlchemy)

Public function signatures identical to JSON version — routes never change.
1 folder = 1 conception (unique constraint on folder_id)
"""

from typing import Optional, List
from datetime import datetime, timezone

from engine.extensions import db
from engine.db_conception import ConceptionDB
import uuid


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _now():
    return datetime.now(timezone.utc)


# ── CREATE / UPDATE ───────────────────────────────────────────────────────────

def save_conception(folder_id: str, input_data: dict, results: dict) -> dict:
    """Upsert — 1 folder = 1 conception."""
    existing = ConceptionDB.query.filter_by(folder_id=folder_id).first()

    if existing:
        existing.input      = input_data
        existing.results    = results
        existing.updated_at = _now()
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(existing, "input")
        flag_modified(existing, "results")
    else:
        existing = ConceptionDB(
            conception_id = str(uuid.uuid4()),
            folder_id     = folder_id,
            input         = input_data,
            results       = results,
        )
        db.session.add(existing)

    db.session.commit()
    return existing.to_dict()


# ── READ ──────────────────────────────────────────────────────────────────────

def get_all_conceptions() -> List[dict]:
    rows = ConceptionDB.query.order_by(ConceptionDB.created_at.desc()).all()
    return [row.to_dict() for row in rows]


def get_conception_by_id(conception_id: str) -> Optional[dict]:
    row = ConceptionDB.query.filter_by(conception_id=conception_id).first()
    return row.to_dict() if row else None


def get_conceptions_by_folder(folder_id: str) -> List[dict]:
    rows = ConceptionDB.query.filter_by(folder_id=folder_id).all()
    return [row.to_dict() for row in rows]


# ── DELETE ────────────────────────────────────────────────────────────────────

def delete_conception(conception_id: str) -> bool:
    row = ConceptionDB.query.filter_by(conception_id=conception_id).first()
    if not row:
        return False
    db.session.delete(row)
    db.session.commit()
    return True


def delete_conceptions_by_folder(folder_id: str) -> int:
    rows = ConceptionDB.query.filter_by(folder_id=folder_id).all()
    count = len(rows)
    if count == 0:
        return 0
    for row in rows:
        db.session.delete(row)
    db.session.commit()
    return count