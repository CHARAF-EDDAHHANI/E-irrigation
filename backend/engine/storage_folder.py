"""
storage_folder.py
_________________
Storage layer — Folder CRUD on db/folders.json

Future migration → replace _load/_dump with SQLAlchemy session calls.
Public function signatures stay identical — routes never change.
"""

import json
from pathlib import Path
from typing import Optional, List
from datetime import datetime, timezone

from models.folder import Folder


# ── PATH ──────────────────────────────────────────────────────────────────────
DB_DIR  = Path(__file__).parent.parent / "db"
DB_FILE = DB_DIR / "folders.json"


# ── FILE HELPERS ──────────────────────────────────────────────────────────────

def _load() -> List[dict]:
    """Load all raw folder dicts from disk. Auto-creates file if missing."""
    DB_DIR.mkdir(parents=True, exist_ok=True)

    if not DB_FILE.exists():
        DB_FILE.write_text("[]", encoding="utf-8")
        return []

    try:
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _dump(data: List[dict]) -> None:
    """Write folder list to disk (pretty-printed)."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    DB_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _is_duplicate(
    folders: List[dict],
    folder_name: str,
    exclude_id: Optional[str] = None
) -> bool:
    """Check duplicate folder name (ignore optional folder_id)."""
    return any(
        f.get("folder_name") == folder_name
        and f.get("folder_id") != exclude_id
        for f in folders
    )


# ── USER ENRICHMENT ───────────────────────────────────────────────────────────

def _enrich_with_users(folder: Folder) -> Folder:
    """
    Attach creator fullName using user_id → fullname mapping.
    Safe fallback if user service fails.
    """
    try:
        from engine.storage_user import get_all_users

        user_map = {
            u.user_id: u.fullName
            for u in get_all_users()
        }

    except Exception:
        user_map = {}

    folder.created_by_user_fullname = user_map.get(
        folder.created_by,
        "Inconnu"
    )

    return folder


# ── CREATE ────────────────────────────────────────────────────────────────────

def save_folder(folder: Folder) -> Folder:
    folders = _load()
    data = folder.to_dict()

    if _is_duplicate(folders, data["folder_name"], exclude_id=data["folder_id"]):
        raise ValueError(
            f"Un dossier nommé '{data['folder_name']}' existe déjà."
        )

    for i, f in enumerate(folders):
        if f.get("folder_id") == folder.folder_id:
            data["created_at"] = f["created_at"]
            data["updated_at"] = _now()
            folders[i] = data
            _dump(folders)
            return folder

    folders.append(data)
    _dump(folders)
    return folder


# ── READ ──────────────────────────────────────────────────────────────────────

def get_all_folders() -> List[Folder]:
    """Return all folders enriched with creator fullname."""
    return [
        _enrich_with_users(Folder.from_dict(f))
        for f in _load()
    ]


def get_folders_by_agent(user_id: str) -> List[Folder]:
    """Return only folders belonging to a specific agent."""
    return [
        _enrich_with_users(Folder.from_dict(f))
        for f in _load()
        if f.get("created_by") == user_id
    ]


def get_folder_by_id(folder_id: str) -> Optional[Folder]:
    """Return one folder by ID."""
    for f in _load():
        if f.get("folder_id") == folder_id:
            return _enrich_with_users(Folder.from_dict(f))
    return None


def folder_exists(folder_id: str) -> bool:
    """Fast existence check."""
    return any(f.get("folder_id") == folder_id for f in _load())


# ── UPDATE ────────────────────────────────────────────────────────────────────

def update_folder(folder_id: str, **fields) -> Optional[Folder]:
    folders = _load()

    for i, f in enumerate(folders):
        if f.get("folder_id") != folder_id:
            continue

        folder = Folder.from_dict(f)
        folder.update(**fields)
        updated = folder.to_dict()

        if _is_duplicate(folders, updated["folder_name"], exclude_id=folder_id):
            raise ValueError(
                f"Un dossier nommé '{updated['folder_name']}' existe déjà."
            )

        updated["created_at"] = f["created_at"]
        updated["updated_at"] = _now()

        folders[i] = updated
        _dump(folders)

        return _enrich_with_users(folder)

    return None


# ── DELETE ────────────────────────────────────────────────────────────────────

def delete_folder(folder_id: str) -> bool:
    folders = _load()

    new_folders = [
        f for f in folders
        if f.get("folder_id") != folder_id
    ]

    if len(new_folders) == len(folders):
        return False

    _dump(new_folders)
    return True