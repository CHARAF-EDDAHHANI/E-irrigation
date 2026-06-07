"""
storage layer :
persist users
retrieve users by id/email
update / delete users

future immigration to :
MYSQL (SQLAlchemy)
"""

import json
from pathlib import Path
from typing import Optional, List
from models.user import User

#------File Path------
DB_DIR= Path(__file__).parent.parent / "db"
DB_FILE = DB_DIR / "user.json"

#-----Internal Helper-----
def _load() -> List[dict]:
    """load all users from json file"""
    DB_DIR.mkdir(parents=True, exist_ok=True)

    if not DB_FILE.exists():
        DB_FILE.write_text("[]", encoding="utf-8")
        return []

    try:
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

def _dump(data: List[dict]) -> None:
    """write users list to json file"""
    DB_DIR.mkdir(parents=True, exist_ok=True)

    DB_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

#-----Core Ops-----

def save_user(user: User) -> User:
    """save or update a user upsert """

    users = _load()
    user_dict = user.to_dict(hide_password=False)

    for i, u in enumerate(users):
        if u.get("user_id") == user.user_id:
            users[i] = user_dict
            _dump(users)
            return user
    
    # new user
    users.append(user_dict)
    _dump(users)
    return  user

def get_all_users() -> List[User]:
    """retrun all users as User object"""
    return [User.from_dict(u) for u in _load()]

def get_user_by_id(user_id: str):
    """return user by Id """
    for u in _load():
        if u.get("user_id") == user_id:
            return User.from_dict(u)
    return None

def get_user_by_email(email:str) -> Optional[User]:
    """retrun user by Email"""
    email = email.lower().strip()

    for u in _load():
        if u.get("email","").lower().strip() == email:
            return User.from_dict(u)
    return None

def get_user_by_phone(phone: str) -> Optional[User]:
    """return user by phone"""
    phone = phone.strip()
    for u in _load():
        if u.get("phone", "").strip() == phone:
            return User.from_dict(u)
    return None
    
def get_user_by_national_id(national_id: str) -> Optional[User]:
    """Retourne un utilisateur via son identifiant national (CIN/ID unique)"""
    if not national_id:
        return None
        
    national_id = national_id.upper().strip() # Standardisation en majuscules

    for u in _load():
        # On vérifie si le champ existe dans le dictionnaire de l'utilisateur
        if u.get("national_id", "").upper().strip() == national_id:
            return User.from_dict(u)
            
    return None


def delete_user(user_id:str) -> bool:
    """true -> delete || false -> none"""
    users = _load()
    new_users = [u for u in users if u.get("user_id") != user_id]

    if len(new_users) == len(users):
        return False

    _dump(new_users)
    return True

def update_user(user_id: str, **fields) -> Optional[User]:
    users = _load()
    for i, u in enumerate(users):
        if u.get("user_id") == user_id:
            user_obj = User.from_dict(u)
            user_obj.update(**fields)

            users[i] = user_obj.to_dict(hide_password=False)

            _dump(users)
            return User.from_dict(users[i])


    return None