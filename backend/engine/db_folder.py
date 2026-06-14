from engine.extensions import db
from datetime import datetime, timezone
import uuid

class FolderDB(db.Model):
    __tablename__ = "folders"

    folder_id               = db.Column(db.String,  primary_key=True, default=lambda: str(uuid.uuid4()))
    folder_name             = db.Column(db.String)
    beneficiary_name        = db.Column(db.String,  nullable=False)
    national_id             = db.Column(db.String,  nullable=False)
    deposit_year            = db.Column(db.Integer, nullable=False)
    phase                   = db.Column(db.String,  default="observation")
    ct_cda_cvm              = db.Column(db.String,  default="")
    adress                  = db.Column(db.String,  default="")
    adress_corr             = db.Column(db.String,  default="")
    serial_number_saba      = db.Column(db.String,  default="")
    area_brut               = db.Column(db.Float,   nullable=True)
    area_net                = db.Column(db.Float,   nullable=True)
    investment              = db.Column(db.Float,   nullable=True)
    investment_per_hectare  = db.Column(db.Float,   nullable=True)
    reimbursed_investment   = db.Column(db.Float,   nullable=True)
    subsidy                 = db.Column(db.Float,   nullable=True)
    percentage              = db.Column(db.Float,   nullable=True)
    company                 = db.Column(db.String,  default="")
    company_phone           = db.Column(db.String,  default="")
    crop                    = db.Column(db.String,  default="")
    documents               = db.Column(db.String,  default="")
    comment                 = db.Column(db.Text,    default="")
    created_by              = db.Column(db.String,  nullable=True)
    created_at              = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at              = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # relationship to documents
    attached_files = db.relationship("DocumentDB", backref="folder", lazy=True, cascade="all, delete-orphan")

    def to_folder_obj(self):
        """Convert SQLAlchemy row → your existing Folder class"""
        from models.folder import Folder
        return Folder.from_dict(self.to_dict())

    def to_dict(self):
        return {
            "folder_id":              self.folder_id,
            "folder_name":            self.folder_name,
            "beneficiary_name":       self.beneficiary_name,
            "national_id":            self.national_id,
            "deposit_year":           self.deposit_year,
            "phase":                  self.phase,
            "ct_cda_cvm":             self.ct_cda_cvm,
            "adress":                 self.adress,
            "adress_corr":            self.adress_corr,
            "serial_number_saba":     self.serial_number_saba,
            "area_brut":              self.area_brut,
            "area_net":               self.area_net,
            "investment":             self.investment,
            "investment_per_hectare": self.investment_per_hectare,
            "reimbursed_investment":  self.reimbursed_investment,
            "subsidy":                self.subsidy,
            "percentage":             self.percentage,
            "company":                self.company,
            "company_phone":          self.company_phone,
            "crop":                   self.crop,
            "documents":              self.documents,
            "comment":                self.comment,
            "created_by":             self.created_by,
            "created_at":             self.created_at.isoformat() if self.created_at else None,
            "updated_at":             self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<FolderDB {self.folder_id[:8]} | {self.folder_name} | {self.phase}>"