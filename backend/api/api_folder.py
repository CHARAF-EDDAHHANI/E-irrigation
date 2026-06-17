"""
api_folder.py
_____________
Folder API — Flask Blueprint registered in server.py
"""

from flask import Blueprint, request, jsonify
from models.folder import Folder
from engine.storage_folder import (
    save_folder,
    get_all_folders,
    get_folders_by_company_phone,
    get_folder_by_id,
    update_folder,
    delete_folder,
    folder_exists,
)
from engine.storage_user import get_user_by_id
from utils.auth import require_auth, get_current_user_object
from engine.extensions import db, supabase
from engine.db_document import DocumentDB, delete_documents_by_folder_id
from engine.storage_conception import delete_conceptions_by_folder_id
from engine.storage_backlog import delete_backlogs_by_folder_id
import uuid
import re
import unicodedata

def _sanitize_filename(filename: str) -> str:
    normalized = unicodedata.normalize("NFKD", filename)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    clean = re.sub(r"[^\w\.\-]", "_", ascii_name)
    clean = re.sub(r"_+", "_", clean).strip("_")
    return clean if clean else "file"


api_folder = Blueprint("api_folder", __name__, url_prefix="/api")


# ── CONSTANTS ─────────────────────────────────────────────────────────────────
ALLOWED_ROLES = {"admin", "agent", "company", "farmer"}
VALID_PHASES = {"observation", "validation", "execution", "cloture"}


# ── ROLE CHECK ─────────────────────────────────────────────────────────────────
def _role_required(current_user):
    if current_user.role not in ALLOWED_ROLES:
        return jsonify({"message": "Action refusée — droits insuffisants."}), 403
    return None


# ── FINANCIALS ────────────────────────────────────────────────────────────────
def _parse_financials(data: dict, existing: Folder = None) -> dict:
    def _float(key, fallback=0.0):
        raw = data.get(key)
        if raw is None and existing:
            raw = getattr(existing, key, fallback)
        try:
            return float(raw or 0.0)
        except (ValueError, TypeError):
            raise ValueError(f"'{key}' doit être un nombre valide.")

    # Added area_brut calculation to handle floats correctly
    area_brut = _float("area_brut")
    area_net = _float("area_net")
    investment = _float("investment")
    subsidy = _float("subsidy")
    reimbursed_inv = _float("reimbursed_investment")

    return {
        "area_brut": area_brut,
        "area_net": area_net,
        "investment": investment,
        "subsidy": subsidy,
        "reimbursed_investment": reimbursed_inv,
        "investment_per_hectare": round(investment / area_net, 2) if area_net > 0 else 0.0,
        "percentage": round((subsidy / reimbursed_inv) * 100, 2) if reimbursed_inv > 0 else 0.0,
    }



# ── RESPONSE SERIALIZER ───────────────────────────────────────────────────────
def _folder_response(folder: Folder) -> dict:
    d = folder.to_dict()

    user = get_user_by_id(folder.created_by)
    d["created_by_user_fullname"] = (
        user.fullName if user else "Inconnu"
    )

     # Attach documents linked to this folder
    docs = DocumentDB.query.filter_by(folder_id=folder.folder_id).all()
    d["documents"] = [doc.to_dict() for doc in docs]

    return d
# ── LIGHTWEIGHT FIELDS ────────────────────────────────────────────────────────
_LIGHTWEIGHT_FIELDS = {
    "folder_id",
    "folder_name",
    "beneficiary_name",
    "area_net",
    "phase",
    "crop",
    "company_phone",
    "created_by_user_fullname",
    "created_at",
    "updated_at",
}

def _folder_light_response(folder):
    data = _folder_response(folder)
    return {k: v for k, v in data.items() if k in _LIGHTWEIGHT_FIELDS}


# ── CREATE ─────────────────────────────────────────────────────────────────────
@api_folder.route("/create-folder", methods=["POST"])
@require_auth
def create_folder():
    current_user = get_current_user_object()

    err = _role_required(current_user)
    if err:
        return err

    data = request.form

    company_phone      = str(data.get("company_phone") or "").strip()
    beneficiary_name   = str(data.get("beneficiary_name") or "").strip()
    national_id        = str(data.get("national_id") or "").strip()
    deposit_year_raw   = data.get("deposit_year")
    adress             = str(data.get("adress") or "").strip()
    adress_corr        = str(data.get("adress_corr") or "").strip()
    serial_number_saba = str(data.get("serial_number_saba") or "").strip()
    ct_cda_cmv         = str(data.get("ct_cda_cmv") or "").strip()

    missing = [k for k, v in [
        ("beneficiary_name", beneficiary_name),
        ("national_id", national_id),
        ("deposit_year", deposit_year_raw),
    ] if not v]

    if missing:
        return jsonify({"message": f"Champs obligatoires manquants : {', '.join(missing)}"}), 400

    try:
        deposit_year = int(deposit_year_raw)
        if not (1990 <= deposit_year <= 2100):
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"message": "deposit_year invalide (1990–2100)."}), 400

    phase = data.get("phase", "observation")
    if phase not in VALID_PHASES:
        return jsonify({"message": "Phase invalide."}), 400

    try:
        fin = _parse_financials(data)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    # Handle file uploads
    uploaded_urls = []
    files = request.files.getlist("files")
    for file in files:
        if file and file.filename:
            try:
                safe_name  = _sanitize_filename(file.filename)
                filename   = f"folders/{uuid.uuid4()}_{safe_name}"
                file_bytes = file.read()
                supabase.storage.from_("documents").upload(
                    path=filename,
                    file=file_bytes,
                    file_options={"content-type": file.content_type or "application/pdf"}
                )
                url = supabase.storage.from_("documents").get_public_url(filename)
                uploaded_urls.append({ "file_name": file.filename, "file_url": url })
            except Exception as exc:
                return jsonify({"message": f"Erreur upload fichier : {exc}"}), 500

    try:
        folder = Folder(
            company_phone      = company_phone,
            adress             = adress,
            adress_corr        = adress_corr,
            serial_number_saba = serial_number_saba,
            beneficiary_name   = beneficiary_name,
            national_id        = national_id,
            deposit_year       = deposit_year,
            phase              = phase,
            ct_cda_cvm         = ct_cda_cmv,
            company            = str(data.get("company") or "").strip(),
            crop               = str(data.get("crop") or "").strip(),
            documents          = str(data.get("documents") or "").strip(),
            comment            = str(data.get("comment") or "").strip(),
            created_by         = current_user.user_id,
            **fin,
        )
        save_folder(folder)

        # Save document records
        for doc_data in uploaded_urls:
            doc = DocumentDB(
                folder_id   = folder.folder_id,
                file_name   = doc_data["file_name"],
                file_url    = doc_data["file_url"],
                uploaded_by = current_user.user_id,
            )
            db.session.add(doc)
        db.session.commit()

    except ValueError as exc:
        return jsonify({"message": str(exc)}), 409
    except Exception as exc:
        return jsonify({"message": f"Erreur création : {exc}"}), 400

    return jsonify({
        "message":   "Dossier créé avec succès.",
        "folder":    _folder_response(folder),
        "documents": uploaded_urls,
    }), 201

# ── LIST FOLDERS ──────────────────────────────────────────────────────────────
@api_folder.route("/allfolders", methods=["GET"])
@require_auth
def list_folders():
    current_user = get_current_user_object()

    err = _role_required(current_user)
    if err:
        return err

    try:
        if current_user.role == "company":
            folders = get_folders_by_company_phone(current_user.user_id)
        else:
            # admin, agent, farmer → all folders
            folders = get_all_folders()

        return jsonify([_folder_light_response(f) for f in folders]), 200

    except Exception as exc:
        return jsonify({"message": f"Erreur lecture : {exc}"}), 500

# ── GET ONE ───────────────────────────────────────────────────────────────────
@api_folder.route("/folders/<folder_id>", methods=["GET"])
@require_auth
def get_folder(folder_id: str):
    current_user = get_current_user_object()

    err = _role_required(current_user)
    if err:
        return err

    folder = get_folder_by_id(folder_id)
    if not folder:
        return jsonify({"message": "Dossier introuvable."}), 404

    # Company can only see their own folders
    if current_user.role == "company" and folder.company_phone != current_user.user_id:
        return jsonify({"message": "Accès refusé."}), 403

    return jsonify(_folder_response(folder)), 200


# ── UPDATE ─────────────────────────────────────────────────────────────────────
@api_folder.route("/folders/<folder_id>", methods=["PUT"])
@require_auth
def update_folder_route(folder_id: str):
    current_user = get_current_user_object()

    err = _role_required(current_user)
    if err:
        return err

    existing = get_folder_by_id(folder_id)
    if not existing:
        return jsonify({"message": "Dossier introuvable."}), 404

    if current_user.role != "admin" and existing.created_by != current_user.user_id:
        return jsonify({"message": "Accès refusé."}), 403

    data = request.get_json(force=True) or {}

    try:
        fin = _parse_financials(data, existing=existing)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    if "phase" in data and data["phase"] not in VALID_PHASES:
        return jsonify({"message": "Phase invalide."}), 400

    data.update(fin)

    try:
        updated = update_folder(folder_id, **data)
        if not updated:
            return jsonify({"message": "Dossier introuvable."}), 404

        return jsonify({
            "message": "Dossier mis à jour avec succès.",
            "folder": _folder_response(updated),
        }), 200

    except ValueError as exc:
        return jsonify({"message": str(exc)}), 409


# ── DELETE ─────────────────────────────────────────────────────────────────────
@api_folder.route("/folders/<folder_id>", methods=["DELETE"])
@require_auth
def delete_folder_route(folder_id: str):
    try:
        current_user = get_current_user_object()

        err = _role_required(current_user)
        if err:
            return err

        # RBAC - only admin can Delete
        if current_user.role != "admin":
            return jsonify({"message": "Accès refusé. Seul l'administrateur peut supprimer des dossiers."}), 403

        existing = get_folder_by_id(folder_id)
        if not existing:
            return jsonify({"message": "Dossier introuvable."}), 404

        # ── Delete childs based on Foreign key <folder_id> ─────────────────────────────────────
        delete_documents_by_folder_id(folder_id)
        delete_conceptions_by_folder_id(folder_id)
        delete_backlogs_by_folder_id(folder_id)

        # ── Deelete parent based on <folder_id> ────────────────────────────────────────────
        deleted = delete_folder(folder_id)

        if not deleted:
            return jsonify({"message": "Suppression échouée."}), 500

        return jsonify({"message": "Dossier et tout son contenu supprimés avec succès."}), 200

    except Exception as e:
        # proper error handling
        return jsonify({"message": "Une erreur interne est survenue.", "error": str(e)}), 500

# ── UPLOAD DOCUMENTS TO EXISTING FOLDER ───────────────────────────────────────
@api_folder.route("/folders/<folder_id>/upload", methods=["POST"])
@require_auth
def upload_folder_documents(folder_id: str):
    current_user = get_current_user_object()

    err = _role_required(current_user)
    if err:
        return err

    try:
        folder = get_folder_by_id(folder_id)
        if not folder:
            return jsonify({"message": "Dossier introuvable."}), 404

        files = request.files.getlist("files")
        if not files:
            return jsonify({"message": "Aucun fichier fourni."}), 400

        uploaded = []
        for file in files:
            if file and file.filename:
                safe_name  = _sanitize_filename(file.filename)
                filename   = f"folders/{uuid.uuid4()}_{safe_name}"
                file_bytes = file.read()
                supabase.storage.from_("documents").upload(
                    path=filename,
                    file=file_bytes,
                    file_options={"content-type": file.content_type or "application/pdf"}
                )
                url = supabase.storage.from_("documents").get_public_url(filename)
                doc = DocumentDB(
                    folder_id   = folder_id,
                    file_name   = file.filename,
                    file_url    = url,
                    uploaded_by = current_user.user_id,
                )
                db.session.add(doc)
                uploaded.append({"file_name": file.filename, "file_url": url})

        db.session.commit()
        return jsonify({"message": "Fichiers uploadés avec succès.", "documents": uploaded}), 201

    except Exception as exc:
        return jsonify({"message": f"Erreur upload : {exc}"}), 500