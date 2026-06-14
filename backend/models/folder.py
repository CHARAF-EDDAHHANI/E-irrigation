import uuid
from datetime import datetime, timezone

class Folder:
    def __init__(
        self,
        beneficiary_name,
        national_id,
        deposit_year,
        phase,
        ct_cda_cvm="",
        adress="",
        adress_corr="",
        serial_number_saba="",
        area_brut=None,
        area_net=None,
        investment=None,
        investment_per_hectare=None,
        reimbursed_investment=None,
        subsidy=None,
        percentage=None,
        company="",
        company_phone="",
        crop="",
        documents="",
        comment="",
        created_by=None,
        folder_id=None,
        folder_name=None,
        created_at=None,
        updated_at=None,
    ):
        self.folder_id = folder_id or str(uuid.uuid4())
        self.folder_name = folder_name or f"DOS_{str(national_id).strip()}_{str(deposit_year)}"
        self.beneficiary_name = str(beneficiary_name).strip()
        self.national_id = str(national_id).strip()
        self.deposit_year = int(deposit_year)
        self.phase = phase
        self.ct_cda_cvm = (ct_cda_cvm or "").strip()
        self.adress = (adress or "").strip()
        self.adress_corr = (adress_corr or "").strip()
        self.serial_number_saba = (serial_number_saba or "").strip()
        self.area_brut = float(area_brut) if area_brut not in (None, "") else None
        self.area_net = float(area_net) if area_net not in (None, "") else None
        self.investment = float(investment) if investment not in (None, "") else None
        self.investment_per_hectare = float(investment_per_hectare) if investment_per_hectare not in (None, "") else (float(investment) / float(area_net) if investment and area_net else None)
        self.reimbursed_investment = float(reimbursed_investment) if reimbursed_investment not in (None, "") else None
        self.subsidy = float(subsidy) if subsidy not in (None, "") else None
        self.percentage = float(percentage) if percentage not in (None, "") else ((float(subsidy) / float(investment)) * 100 if subsidy and investment else None)
        self.company = (company or "").strip()
        self.company_phone = (company_phone or "").strip()
        self.crop = (crop or "").strip()
        self.documents = (documents or "").strip()
        self.comment = (comment or "").strip()
        self.created_by = created_by
        
        now = datetime.now(timezone.utc).isoformat()
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def to_dict(self) -> dict:
        return {
            "folder_id": self.folder_id, "folder_name": self.folder_name, "beneficiary_name": self.beneficiary_name,
            "national_id": self.national_id, "deposit_year": self.deposit_year, "ct_cda_cvm": self.ct_cda_cvm,
            "adress": self.adress, "adress_corr": self.adress_corr, "serial_number_saba": self.serial_number_saba,
            "area_brut": self.area_brut, "area_net": self.area_net, "investment": self.investment,
            "investment_per_hectare": self.investment_per_hectare, "reimbursed_investment": self.reimbursed_investment,
            "subsidy": self.subsidy, "percentage": self.percentage, "phase": self.phase,
            "company": self.company, "company_phone": self.company_phone, "crop": self.crop, "documents": self.documents, "comment": self.comment,
            "created_by": self.created_by, "created_at": self.created_at, "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Folder":
        return cls(
            folder_id=data.get("folder_id"), folder_name=data.get("folder_name"), beneficiary_name=data.get("beneficiary_name", ""),
            national_id=data.get("national_id", ""), deposit_year=data.get("deposit_year"), ct_cda_cvm=data.get("ct_cda_cvm", ""),
            adress=data.get("adress", ""), adress_corr=data.get("adress_corr", ""), serial_number_saba=data.get("serial_number_saba", ""),
            area_brut=data.get("area_brut"), area_net=data.get("area_net"), investment=data.get("investment"),
            investment_per_hectare=data.get("investment_per_hectare"), reimbursed_investment=data.get("reimbursed_investment"),
            subsidy=data.get("subsidy"), percentage=data.get("percentage"), phase=data.get("phase", "observation"),
            company=data.get("company", ""), company_phone=data.get("company_phone", ""), crop=data.get("crop", ""), documents=data.get("documents", ""),
            comment=data.get("comment", ""), created_by=data.get("created_by"), created_at=data.get("created_at"), updated_at=data.get("updated_at"),
        )

    def update(self, **kwargs) -> None:
        ALLOWED = {
            "beneficiary_name", "national_id", "deposit_year", "ct_cda_cvm", "adress", "adress_corr", 
            "serial_number_saba", "area_brut", "company_phone", "area_net", "investment", "investment_per_hectare", 
            "reimbursed_investment", "subsidy", "percentage", "phase", "company", "crop", "documents", "comment",
        }
        for key, value in kwargs.items():
            if key in ALLOWED: setattr(self, key, value)
        self.folder_name = f"DOS_{self.national_id}_{self.deposit_year}"
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def __repr__(self) -> str:
        return f"<Folder {self.folder_id[:8]} | {self.folder_name} | {self.phase}>"
