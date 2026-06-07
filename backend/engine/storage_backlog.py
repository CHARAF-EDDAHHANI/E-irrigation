import json
from pathlib import Path
from typing import Optional, List, Dict
from models.backlog_box import BacklogBox

# ------ System File Paths Definitions ------
DB_DIR = Path(__file__).parent.parent / "db"
DB_FILE = DB_DIR / "backlog_boxes.json"

# ----- Internal Low-Level Storage Helpers -----
def _load() -> List[Dict]:
    """Reads and parses raw records directly out of the JSON storage file."""
    DB_DIR.mkdir(parents=True, exist_ok=True)

    if not DB_FILE.exists():
        DB_FILE.write_text("[]", encoding="utf-8")
        return []

    try:
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

def _dump(data: List[Dict]) -> None:
    """Writes absolute operational arrays back down inside the local storage safely."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    DB_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

# ----- Core Strategic CRUD Operations -----

def save_backlogbox(box: BacklogBox) -> BacklogBox:
    """
    Executes an atomic write loop (Upsert operation).
    Replaces existing blocks when active chats append fresh items.
    """
    boxes = _load()
    box_dict = box.to_dict()

    for i, b in enumerate(boxes):
        if b.get("backlogbox_id") == box.backlogbox_id:
            boxes[i] = box_dict
            _dump(boxes)
            return box
    
    # Registering a newly initialized box inside the collection array
    boxes.append(box_dict)
    _dump(boxes)
    return box

def get_backlogbox_by_folder(folder_id: str) -> Optional[BacklogBox]:
    """
    Queries and extracts the unconstrained chat object referencing a targeted folder.
    Returns 100% of historical sub-data chains unstripped.
    """
    if not folder_id:
        return None

    for b in _load():
        if b.get("folder_id") == folder_id:
            return BacklogBox.from_dict(b)
            
    return None

# get the backlogbox by id 
def get_backlogbox_by_id(backlogbox_id: str) -> Optional[BacklogBox]:
    """
    Queries and extracts the unconstrained chat object referencing a targeted box using its id.
    Returns 100% of historical sub-data chains unstripped.
    """
    if not backlogbox_id:
        return None

    # On charge la liste et on cherche la boîte correspondante
    for b in _load():
        if b.get("backlogbox_id") == backlogbox_id:
            return BacklogBox.from_dict(b)
            
    return None

#all bcaklogs by currentuserid
def get_all_backlogboxes() -> List[Dict]:
    """
    Public helper to retrieve the entire raw collection of backlog boxes.
    Keeps the low-level _load() helper encapsulated.
    """
    return _load()

