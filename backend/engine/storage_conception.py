import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, List

# ─────────────────────────────────────────────
# STORAGE FILE
# ─────────────────────────────────────────────

DB_DIR = Path(__file__).parent.parent / "db"
DB_FILE = DB_DIR / "conceptions.json"


# ─────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────

def _load() -> List[dict]:
    DB_DIR.mkdir(parents=True, exist_ok=True)

    if not DB_FILE.exists():
        DB_FILE.write_text("[]", encoding="utf-8")
        return []

    try:
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _dump(records: List[dict]) -> None:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    DB_FILE.write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────
# CORE UPSERT FUNCTION (1 folder = 1 conception)
# ─────────────────────────────────────────────

def save_conception(
    folder_id: str,
    input_data: dict,
    results: dict
) -> dict:
    """
    Crée ou met à jour l'unique conception liée à un dossier (1 dossier = 1 conception).
    """
    records = _load()
    now = _now()

    # ─────────────────────────────────────────
    # UPDATE IF EXISTS (par folder_id)
    # ─────────────────────────────────────────
    for rec in records:
        if rec.get("folder_id") == folder_id:
            rec["input"] = input_data
            rec["results"] = results
            rec["updated_at"] = now
            _dump(records)
            return rec

    # ─────────────────────────────────────────
    # CREATE NEW IF NOT EXISTS
    # ─────────────────────────────────────────
    new_record = {
        "conception_id": str(uuid.uuid4()),
        "folder_id": folder_id,
        "created_at": now,
        "updated_at": now,
        "input": input_data,
        "results": results
    }

    records.append(new_record)
    _dump(records)
    return new_record


# ─────────────────────────────────────────────
# GET ALL (MODIFIÉ : RETOURNE LES DONNÉES COMPLÈTES)
# ─────────────────────────────────────────────

def get_all_conceptions() -> List[dict]:
    """
    Retourne la liste de toutes les conceptions sans aucun filtre.
    Idéal pour l'affichage complet des données dans les tableaux.
    """
    return _load()


# ─────────────────────────────────────────────
# GET BY ID (FULL DETAIL)
# ─────────────────────────────────────────────

def get_conception_by_id(conception_id: str) -> Optional[dict]:
    for rec in _load():
        if rec.get("conception_id") == conception_id:
            return rec
    return None


# ─────────────────────────────────────────────
# GET BY FOLDER (ONLY ONE RESULT EXPECTED)
# ─────────────────────────────────────────────

def get_conceptions_by_folder(folder_id: str) -> List[dict]:
    return [
        rec for rec in _load()
        if rec.get("folder_id") == folder_id
    ]


# ─────────────────────────────────────────────
# DELETE SINGLE
# ─────────────────────────────────────────────

def delete_conception(conception_id: str) -> bool:
    records = _load()

    new_records = [
        r for r in records
        if r.get("conception_id") != conception_id
    ]

    if len(new_records) == len(records):
        return False

    _dump(new_records)
    return True


# ─────────────────────────────────────────────
# DELETE BY FOLDER (CASCADE)
# ─────────────────────────────────────────────

def delete_conceptions_by_folder(folder_id: str) -> int:
    records = _load()

    new_records = [
        r for r in records
        if r.get("folder_id") != folder_id
    ]

    deleted = len(records) - len(new_records)

    if deleted > 0:
        _dump(new_records)

    return deleted