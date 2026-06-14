"""
storage_folder.py
_________________
Storage layer — Folder CRUD on Supabase PostgreSQL (SQLAlchemy)

Public function signatures identical to JSON version — routes never change.
"""

from typing import Optional, List
from datetime import datetime, timezone

from engine.extensions import db
from engine.db_folder import FolderDB
from models.folder import Folder


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _now():
    return datetime.now(timezone.utc)


def _to_folder(row: FolderDB) -> Folder:
    """Convert SQLAlchemy row → Folder model object."""
    return Folder.from_dict(row.to_dict())


def _enrich_with_users(folder: Folder) -> Folder:
    """Attach creator fullName using user_id → fullname mapping."""
    try:
        from engine.storage_user import get_all_users
        user_map = {u.user_id: u.fullName for u in get_all_users()}
    except Exception:
        user_map = {}

    folder.created_by_user_fullname = user_map.get(folder.created_by, "Inconnu")
    return folder


def _is_duplicate(folder_name: str, exclude_id: Optional[str] = None) -> bool:
    """Check duplicate folder name in DB."""
    query = FolderDB.query.filter_by(folder_name=folder_name)
    if exclude_id:
        query = query.filter(FolderDB.folder_id != exclude_id)
    return query.first() is not None


# ── CREATE ────────────────────────────────────────────────────────────────────

def save_folder(folder: Folder) -> Folder:
    if _is_duplicate(folder.folder_name, exclude_id=folder.folder_id):
        raise ValueError(f"Un dossier nommé '{folder.folder_name}' existe déjà.")

    # Check if already exists → update
    existing = FolderDB.query.filter_by(folder_id=folder.folder_id).first()

    if existing:
        for key, value in folder.to_dict().items():
            if key not in ("folder_id", "created_at") and hasattr(existing, key):
                setattr(existing, key, value)
        existing.updated_at = _now()
    else:
        existing = FolderDB(
            folder_id               = folder.folder_id,
            folder_name             = folder.folder_name,
            beneficiary_name        = folder.beneficiary_name,
            national_id             = folder.national_id,
            deposit_year            = folder.deposit_year,
            phase                   = folder.phase,
            ct_cda_cvm              = folder.ct_cda_cvm,
            adress                  = folder.adress,
            adress_corr             = folder.adress_corr,
            serial_number_saba      = folder.serial_number_saba,
            area_brut               = folder.area_brut,
            area_net                = folder.area_net,
            investment              = folder.investment,
            investment_per_hectare  = folder.investment_per_hectare,
            reimbursed_investment   = folder.reimbursed_investment,
            subsidy                 = folder.subsidy,
            percentage              = folder.percentage,
            company                 = folder.company,
            company_phone           = folder.company_phone,
            crop                    = folder.crop,
            documents               = folder.documents,
            comment                 = folder.comment,
            created_by              = folder.created_by,
        )
        db.session.add(existing)

    db.session.commit()
    return folder


# ── READ ──────────────────────────────────────────────────────────────────────

def get_all_folders() -> List[Folder]:
    rows = FolderDB.query.order_by(FolderDB.created_at.desc()).all()
    print(f"DEBUG get_all_folders: found {len(rows)} rows")  # ← add this

    return [_enrich_with_users(_to_folder(row)) for row in rows]


def get_folders_by_company_phone(user_id: str) -> List[Folder]:
    rows = FolderDB.query.filter_by(created_by=user_id).order_by(FolderDB.created_at.desc()).all()
    return [_enrich_with_users(_to_folder(row)) for row in rows]


def get_folder_by_id(folder_id: str) -> Optional[Folder]:
    row = FolderDB.query.filter_by(folder_id=folder_id).first()
    if not row:
        return None
    return _enrich_with_users(_to_folder(row))


def folder_exists(folder_id: str) -> bool:
    return FolderDB.query.filter_by(folder_id=folder_id).first() is not None


# ── UPDATE ────────────────────────────────────────────────────────────────────

def update_folder(folder_id: str, **fields) -> Optional[Folder]:
    row = FolderDB.query.filter_by(folder_id=folder_id).first()
    if not row:
        return None

    folder = _to_folder(row)
    folder.update(**fields)
    updated = folder.to_dict()

    if _is_duplicate(updated["folder_name"], exclude_id=folder_id):
        raise ValueError(f"Un dossier nommé '{updated['folder_name']}' existe déjà.")

    for key, value in updated.items():
        if key not in ("folder_id", "created_at") and hasattr(row, key):
            setattr(row, key, value)

    row.updated_at = _now()
    db.session.commit()

    return _enrich_with_users(folder)


# ── DELETE ────────────────────────────────────────────────────────────────────

def delete_folder(folder_id: str) -> bool:
    row = FolderDB.query.filter_by(folder_id=folder_id).first()
    if not row:
        return False

    db.session.delete(row)
    db.session.commit()
    return True