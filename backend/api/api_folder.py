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
    get_folders_by_agent,
    get_folder_by_id,
    update_folder,
    delete_folder,
    folder_exists,
)
from utils.auth import require_auth, get_current_user_object


api_folder = Blueprint("api_folder", __name__, url_prefix="/api")


# ── CONSTANTS ─────────────────────────────────────────────────────────────────
ALLOWED_ROLES = {"admin", "agent"}
VALID_PHASES = {"prealable", "validation", "execution", "cloture"}


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

    area = _float("area")
    investment = _float("investment")
    subsidy = _float("subsidy")
    reimbursed_inv = _float("reimbursed_investment")

    return {
        "area": area,
        "investment": investment,
        "subsidy": subsidy,
        "reimbursed_investment": reimbursed_inv,
        "investment_per_hectare": round(investment / area, 2) if area > 0 else 0.0,
        "percentage": round((subsidy / reimbursed_inv) * 100, 2) if reimbursed_inv > 0 else 0.0,
    }


# ── RESPONSE SERIALIZER ───────────────────────────────────────────────────────
def _folder_response(folder: Folder) -> dict:
    d = folder.to_dict()

    # IMPORTANT: match storage_folder.py field name
    d["created_by_user_fullname"] = getattr(
        folder,
        "created_by_user_fullname",
        "Inconnu"
    )

    return d


# ── LIGHTWEIGHT FIELDS ────────────────────────────────────────────────────────
_LIGHTWEIGHT_FIELDS = {
    "folder_id",
    "folder_name",
    "beneficiary_name",
    "area",
    "phase",
    "crop",
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

    data = request.get_json(force=True) or {}

    beneficiary_name = str(data.get("beneficiary_name") or "").strip()
    national_id = str(data.get("national_id") or "").strip()
    deposit_year_raw = data.get("deposit_year")

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

    phase = data.get("phase", "prealable")
    if phase not in VALID_PHASES:
        return jsonify({"message": "Phase invalide."}), 400

    try:
        fin = _parse_financials(data)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    try:
        folder = Folder(
            beneficiary_name=beneficiary_name,
            national_id=national_id,
            deposit_year=deposit_year,
            phase=phase,
            cvm=str(data.get("cvm") or "").strip(),
            company=str(data.get("company") or "").strip(),
            crop=str(data.get("crop") or "").strip(),
            documents=str(data.get("documents") or "").strip(),
            comment=str(data.get("comment") or "").strip(),
            created_by=current_user.user_id,
            **fin,
        )

        save_folder(folder)

    except ValueError as exc:
        return jsonify({"message": str(exc)}), 409
    except Exception as exc:
        return jsonify({"message": f"Erreur création : {exc}"}), 400

    return jsonify({
        "message": "Dossier créé avec succès.",
        "folder": _folder_response(folder),
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
        folders = (
            get_all_folders()
            if current_user.role == "admin"
            else get_folders_by_agent(current_user.user_id)
        )

        response_data = [
            _folder_light_response(folder)
            for folder in folders
        ]
        
        return jsonify(response_data), 200

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

    if current_user.role != "admin" and folder.created_by != current_user.user_id:
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
    current_user = get_current_user_object()

    err = _role_required(current_user)
    if err:
        return err

    existing = get_folder_by_id(folder_id)
    if not existing:
        return jsonify({"message": "Dossier introuvable."}), 404

    if current_user.role != "admin" and existing.created_by != current_user.user_id:
        return jsonify({"message": "Accès refusé."}), 403

    deleted = delete_folder(folder_id)

    if not deleted:
        return jsonify({"message": "Suppression échouée."}), 500

    return jsonify({"message": "Dossier supprimé avec succès."}), 200