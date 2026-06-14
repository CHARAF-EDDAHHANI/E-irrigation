from engine.extensions import db
from datetime import datetime, timezone
import uuid

class BacklogBoxDB(db.Model):
    __tablename__ = "backlog_boxes"

    backlogbox_id = db.Column(db.String,   primary_key=True, default=lambda: str(uuid.uuid4()))
    folder_id     = db.Column(db.String,   db.ForeignKey("folders.folder_id"), nullable=False)
    created_by    = db.Column(db.String,   nullable=False)
    company_id    = db.Column(db.String,   nullable=False)
    messages      = db.Column(db.JSON,     default=list)   # JSONB array — keeps embedded structure
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "backlogbox_id": self.backlogbox_id,
            "folder_id":     self.folder_id,
            "created_by":    self.created_by,
            "company_id":    self.company_id,
            "messages":      self.messages or [],
            "created_at":    self.created_at.isoformat() if self.created_at else None,
            "updated_at":    self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<BacklogBoxDB {self.backlogbox_id[:8]} | folder={self.folder_id[:8]}>"