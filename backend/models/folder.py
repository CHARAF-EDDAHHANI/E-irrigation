"""
Folder Model
____________
Represents a project folder grouping hydraulic conception designs.
____________
Fields:
    folder_id          : uuid — PK (auto-generated)
    folder_name        : str  — auto-generated unique name
    beneficiary_name   : str  — exploitant name
    national_id        : str  — CIN / CNE
    deposit_year       : int  — year of submission
    cvm                : str  — Centre de Mise en Valeur
    area               : float — irrigated surface in ha
    investment         : float — total investment (DH)
    investment_per_hectare : float
    reimbursed_investment  : float — retained investment
    subsidy            : float — subvention (DH)
    percentage         : float — subsidy percentage
    phase              : str
    company            : str  — company name
    crop               : str  — main crop type
    documents          : str  — comma-separated doc list
    comment            : str  — free observations
    created_by_user_id : str  — user_id FK
    created_at         : datetime ISO
    updated_at         : datetime ISO
____________
"""

import uuid
from datetime import datetime, timezone


class Folder:
    """
    Folder model — JSON-based storage compatible.
    """

    def __init__(
        self,
        beneficiary_name,
        national_id,
        deposit_year,
        phase,
        cvm="",
        area=None,
        investment=None,
        investment_per_hectare=None,
        reimbursed_investment=None,
        subsidy=None,
        percentage=None,
        company="",
        crop="",
        documents="",
        comment="",
        created_by=None,
        folder_id=None,
        folder_name=None,
        created_at=None,
        updated_at=None,
    ):
        national_id = str(national_id).strip()
        deposit_year = str(deposit_year)

        self.folder_id = folder_id or str(uuid.uuid4())

        # Auto-generated folder name
        self.folder_name = (
            folder_name
            or f"DOS_{national_id}_{deposit_year}"
        )

        self.beneficiary_name = beneficiary_name.strip()
        self.national_id = national_id
        self.deposit_year = deposit_year
        self.phase = phase

        self.cvm = (cvm or "").strip()
        self.area = float(area) if area not in (None, "") else None
        self.investment = float(investment) if investment not in (None, "") else None
        self.investment_per_hectare = (
            float(investment) / float(area)
            if investment not in (None, "") and area not in (None, 0, "")
            else None
        )
        self.reimbursed_investment = (
            float(reimbursed_investment)
            if reimbursed_investment not in (None, "")
            else None
        )
        self.subsidy = float(subsidy) if subsidy not in (None, "") else None
        self.percentage = (
            (float(subsidy) / float(investment)) * 100
            if subsidy not in (None, "") and investment not in (None, 0, "")
            else None
        )

        self.company = (company or "").strip()
        self.crop = (crop or "").strip()
        self.documents = (documents or "").strip()
        self.comment = (comment or "").strip()

        # FK → user.user_id
        self.created_by = created_by
        
        now = datetime.now(timezone.utc).isoformat()
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def to_dict(self) -> dict:
        return {
            "folder_id": self.folder_id,
            "folder_name": self.folder_name,
            "beneficiary_name": self.beneficiary_name,
            "national_id": self.national_id,
            "deposit_year": self.deposit_year,
            "cvm": self.cvm,
            "area": self.area,
            "investment": self.investment,
            "investment_per_hectare": self.investment_per_hectare,
            "reimbursed_investment": self.reimbursed_investment,
            "subsidy": self.subsidy,
            "percentage": self.percentage,
            "phase": self.phase,
            "company": self.company,
            "crop": self.crop,
            "documents": self.documents,
            "comment": self.comment,
            "created_by": self.created_by,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Folder":
        return cls(
            folder_id=data.get("folder_id"),
            folder_name=data.get("folder_name"),
            beneficiary_name=data.get("beneficiary_name", ""),
            national_id=data.get("national_id", ""),
            deposit_year=data.get("deposit_year"),
            cvm=data.get("cvm", ""),
            area=data.get("area"),
            investment=data.get("investment"),
            investment_per_hectare=data.get("investment_per_hectare"),
            reimbursed_investment=data.get("reimbursed_investment"),
            subsidy=data.get("subsidy"),
            percentage=data.get("percentage"),
            phase=data.get("phase", "prealable"),
            company=data.get("company", ""),
            crop=data.get("crop", ""),
            documents=data.get("documents", ""),
            comment=data.get("comment", ""),
            created_by=data.get("created_by"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    def update(self, **kwargs) -> None:
        """
        folder_name excluded because it is auto-generated.
        """

        ALLOWED = {
            "beneficiary_name",
            "national_id",
            "deposit_year",
            "cvm",
            "area",
            "investment",
            "investment_per_hectare",
            "reimbursed_investment",
            "subsidy",
            "percentage",
            "phase",
            "company",
            "crop",
            "documents",
            "comment",
        }

        for key, value in kwargs.items():
            if key in ALLOWED:
                setattr(self, key, value)

        # Regenerate folder_name automatically
        self.folder_name = f"DOS_{self.national_id}_{self.deposit_year}"

        self.updated_at = datetime.now(timezone.utc).isoformat()

    def __repr__(self) -> str:
        return (
            f"<Folder {self.folder_id[:8]} | "
            f"{self.folder_name} | {self.phase}>"
        )