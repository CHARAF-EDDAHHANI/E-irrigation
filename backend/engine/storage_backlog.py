"""
storage_backlog.py
__________________
Storage layer — BacklogBox CRUD on Supabase PostgreSQL (SQLAlchemy)
Supports embedded messages array with optional file attachments.

Public function signatures identical to JSON version — routes never change.
"""

from typing import Optional, List, Dict
from datetime import datetime, timezone
from sqlalchemy.orm.attributes import flag_modified

from engine.extensions import db, supabase
from engine.db_backlog import BacklogBoxDB
from models.backlog_box import BacklogBox
import uuid


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _now():
    return datetime.now(timezone.utc)


def _to_box(row: BacklogBoxDB) -> BacklogBox:
    """Convert SQLAlchemy row → BacklogBox model object."""
    return BacklogBox.from_dict(row.to_dict())


# ── FILE UPLOAD ───────────────────────────────────────────────────────────────

def upload_message_file(file, backlogbox_id: str) -> dict:
    """
    Upload a file to Supabase Storage inside backlog/ folder.
    Returns dict with file_url and file_name.
    """
    filename  = f"backlog/{backlogbox_id}/{uuid.uuid4()}_{file.filename}"
    file_bytes = file.read()

    supabase.storage.from_("documents").upload(
        path=filename,
        file=file_bytes,
        file_options={"content-type": file.content_type or "application/octet-stream"}
    )

    url = supabase.storage.from_("documents").get_public_url(filename)

    return {
        "file_url":  url,
        "file_name": file.filename,
    }


# ── CREATE / UPDATE ───────────────────────────────────────────────────────────

def save_backlogbox(box: BacklogBox) -> BacklogBox:
    """Atomic upsert — replaces existing box or inserts new one."""
    existing = BacklogBoxDB.query.filter_by(backlogbox_id=box.backlogbox_id).first()

    if existing:
        existing.messages  = box.messages
        existing.updated_at = _now()
        # Tell SQLAlchemy the JSON column changed
        flag_modified(existing, "messages")
    else:
        existing = BacklogBoxDB(
            backlogbox_id = box.backlogbox_id,
            folder_id     = box.folder_id,
            created_by    = box.created_by,
            company_id    = box.company_id,
            messages      = box.messages,
        )
        db.session.add(existing)

    db.session.commit()
    return box


# ── READ ──────────────────────────────────────────────────────────────────────

def get_backlogbox_by_folder(folder_id: str) -> Optional[BacklogBox]:
    if not folder_id:
        return None
    row = BacklogBoxDB.query.filter_by(folder_id=folder_id).first()
    return _to_box(row) if row else None


def get_backlogbox_by_id(backlogbox_id: str) -> Optional[BacklogBox]:
    if not backlogbox_id:
        return None
    row = BacklogBoxDB.query.filter_by(backlogbox_id=backlogbox_id).first()
    return _to_box(row) if row else None


def get_all_backlogboxes() -> List[Dict]:
    rows = BacklogBoxDB.query.order_by(BacklogBoxDB.created_at.desc()).all()
    return [row.to_dict() for row in rows]

def delete_backlogs_by_folder_id(folder_id: str) -> bool:
    """delete all backlogboxs based on folder_id."""
    try:
        db.session.query(BacklogBoxDB).filter(BacklogBoxDB.folder_id == folder_id).delete()
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Erreur lors de la suppression des backlogs : {e}")
        return False