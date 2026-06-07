"""
userModel
_______________
application ( admin,agents,agricultors,companies)
_______________
Fields:
user_id: uuid PK
email: login identifier
password : hashed pass bcrypt
fullName: user pseudo
role : admin,agents,agricultors,companies
CreatedAt: DateTime
UpdatedAt: DateTime
_______________
"""
import uuid
from datetime import datetime, timezone

class User:
    """simple user model Json-based storage compatible"""

    def __init__(self,
        email,
        password, 
        fullName, 
        role="user",
        phone=None,
        national_id=None,
        user_id=None,
        created_at=None,
        updated_at=None,
    ):
        self.user_id = user_id or  str(uuid.uuid4())
        self.email = email.lower().strip()
        self.password = password
        self.fullName = fullName
        self.role = role

        if self.role in ["farmer", "company"] and not phone:
            raise ValueError(f"Le numéro de téléphone est obligatoire pour le rôle : {self.role}")

        self.phone = phone.strip() if phone else None
        self.national_id = national_id.upper().strip() if national_id else None
        #generate <company><user_id>using the <phonenum>
        if self.role in ["company"]:
            self.user_id = user_id or self.phone
        else:
            self.user_id = user_id or str(uuid.uuid4())

        now = datetime.now(timezone.utc).isoformat()
        self.created_at = created_at or now
        self.updated_at = updated_at or now
    
    #--------------
    #CORE METHODE
    #--------------
    #serialization
    def to_dict(self, hide_password=True):
        data = {
            "user_id": self.user_id,
            "email": self.email,
            "fullName": self.fullName,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

        if self.phone:
            data["phone"] = self.phone
        if self.national_id:
            data["national_id"] = self.national_id

        if not hide_password:
            data["password"] = self.password
        
        return data

    @classmethod
    def from_dict(cls, data: dict):
        
        return cls(
            user_id=data.get("user_id"),
            email=data.get("email"),
            password=data.get("password"),
            fullName=data.get("fullName"),
            role=data.get("role", "user"),
            phone=data.get("phone"),
            national_id=data.get("national_id"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    def update(self, **kwargs):
        allowed_fields = [ "email", "fullName", "role", "phone", "national_id"]
        for key, value in kwargs.items():
            if key in allowed_fields:
                if key == "phone" and self.role in ["farmer", "company"] and not value:
                    raise ValueError(f"Impossible de supprimer le téléphone pour le rôle : {self.role}")
                #cleaning the array of carracteres
                if value and isinstance(value, str):
                    value = value.strip()
                    if key == "national_id":
                        value = value.upper()
                setattr(self, key, value)
        
        self.updated_at = datetime.now(timezone.utc).isoformat()