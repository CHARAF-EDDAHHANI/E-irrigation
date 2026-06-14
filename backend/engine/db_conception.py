from engine.extensions import db
from datetime import datetime, timezone
import uuid

class ConceptionDB(db.Model):
    __tablename__ = "conceptions"

    conception_id = db.Column(db.String,  primary_key=True, default=lambda: str(uuid.uuid4()))
    folder_id     = db.Column(db.String,  db.ForeignKey("folders.folder_id"), unique=True, nullable=False)
    input         = db.Column(db.JSON,    nullable=True)
    results       = db.Column(db.JSON,    nullable=True)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "conception_id": self.conception_id,
            "folder_id":     self.folder_id,
            "input":         self.input,
            "results":       self.results,
            "created_at":    self.created_at.isoformat() if self.created_at else None,
            "updated_at":    self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<ConceptionDB {self.conception_id[:8]} | folder={self.folder_id[:8]}>"