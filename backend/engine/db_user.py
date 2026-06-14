# engine/db_user.py
from engine.extensions import db
from datetime import datetime, timezone
import uuid

class UserDB(db.Model):
    __tablename__ = "users"

    user_id     = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fullName    = db.Column(db.String,  nullable=False)
    email       = db.Column(db.String,  unique=True, nullable=False)
    password    = db.Column(db.String,  nullable=False)
    role        = db.Column(db.String,  default="user")
    phone       = db.Column(db.String,  nullable=True)
    national_id = db.Column(db.String,  nullable=True)
    created_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self, hide_password=True):
        return {
            "user_id":     self.user_id,
            "fullName":    self.fullName,
            "email":       self.email,
            "password":    "" if hide_password else self.password,
            "role":        self.role,
            "phone":       self.phone,
            "national_id": self.national_id,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
            "updated_at":  self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<UserDB {self.user_id[:8]} | {self.fullName} | {self.role}>"