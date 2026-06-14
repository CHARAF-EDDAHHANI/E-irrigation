from engine.extensions import db
from datetime import datetime, timezone
import uuid

class DocumentDB(db.Model):
    __tablename__ = "documents"

    doc_id      = db.Column(db.String,  primary_key=True, default=lambda: str(uuid.uuid4()))
    folder_id   = db.Column(db.String,  db.ForeignKey("folders.folder_id"), nullable=False)
    file_name   = db.Column(db.String)
    file_url    = db.Column(db.String)
    uploaded_by = db.Column(db.String)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "doc_id":      self.doc_id,
            "folder_id":   self.folder_id,
            "file_name":   self.file_name,
            "file_url":    self.file_url,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }