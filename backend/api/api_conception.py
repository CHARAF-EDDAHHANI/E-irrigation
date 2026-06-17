from flask import Blueprint, request, jsonify
from models.conception_calculator import run_calculations
from engine.storage_conception import (
    save_conception,
    get_all_conceptions,
    get_conception_by_id,
    get_conceptions_by_folder,
    delete_conception,
    delete_conceptions_by_folder_id,
)
from utils.auth import require_auth, get_current_user_object

api_conception = Blueprint("api_conception", __name__, url_prefix="/api")


# ── HEALTH ────────────────────────────────────────────────────────────────────
@api_conception.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "conceptions_count": len(get_all_conceptions()),
    })


# ── CALCULATE ─────────────────────────────────────────────────────────────────
@api_conception.route("/calculate", methods=["POST"])
@require_auth
def calculate():
    current_user = get_current_user_object()
    if current_user.role not in {"admin", "agent", "company"}:
        return jsonify({"success": False, "error": "Accès refusé."}), 403
    try:
        payload = request.get_json(force=True)
        if not payload.get("folder_id"):
            return jsonify({"success": False, "error": "folder_id obligatoire"}), 400
        results = run_calculations(payload)
        return jsonify({"success": True, "results": results})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 400


# ── SAVE (UPSERT) ─────────────────────────────────────────────────────────────
@api_conception.route("/conceptions/save", methods=["POST"])
@require_auth
def save():
    current_user = get_current_user_object()
    if current_user.role not in {"admin", "agent", "company"}:
        return jsonify({"success": False, "error": "Accès refusé."}), 403
    try:
        body       = request.get_json(force=True)
        folder_id  = body.get("folder_id", "").strip()
        input_data = body.get("input", {})
        results    = body.get("results")

        if not folder_id:
            return jsonify({"success": False, "error": "folder_id obligatoire"}), 400
        if results is None:
            return jsonify({"success": False, "error": "results obligatoire"}), 400

        record = save_conception(folder_id=folder_id, input_data=input_data, results=results)
        return jsonify({
            "success": True,
            "action": "updated_or_created",
            "conception_id": record["conception_id"],
            "data": record,
        })
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 400


# ── DELETE SINGLE ─────────────────────────────────────────────────────────────
@api_conception.route("/conceptions/<string:conception_id>", methods=["DELETE"])
@require_auth
def delete_conception_route(conception_id):
    current_user = get_current_user_object()
    if current_user.role not in {"admin", "agent", "company"}:
        return jsonify({"success": False, "message": "Accès refusé."}), 403

    ok = delete_conception(conception_id)
    if not ok:
        return jsonify({"success": False, "error": "Conception introuvable"}), 404
    return jsonify({"success": True, "message": "Conception supprimée."}), 200


# ── DELETE BY FOLDER ──────────────────────────────────────────────────────────
@api_conception.route("/conceptions/folder/<string:folder_id>", methods=["DELETE"])
@require_auth
def delete_conception_by_folder(folder_id):
    current_user = get_current_user_object()
    if current_user.role not in {"admin", "agent", "company"}:
        return jsonify({"success": False, "message": "Accès refusé."}), 403
    try:
        count = delete_conceptions_by_folder_id(folder_id)
        return jsonify({"success": True, "message": f"{count} conception(s) supprimée(s)."}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": f"Erreur suppression : {exc}"}), 500


# ── GET BY FOLDER ─────────────────────────────────────────────────────────────
@api_conception.route("/conceptions/folder/<string:folder_id>", methods=["GET"])
@require_auth
def get_by_folder(folder_id):
    records = get_conceptions_by_folder(folder_id)
    if not records:
        return jsonify({"success": False, "error": "Aucune conception trouvée"}), 404
    return jsonify({"success": True, "data": records[0]})

# ── GET BY CONCEPTION ID ──────────────────────────────────────────────────────
@api_conception.route("/conceptions/<string:conception_id>", methods=["GET"])
@require_auth
def get_conception(conception_id):
    record = get_conception_by_id(conception_id)
    if not record:
        return jsonify({"success": False, "error": "Conception introuvable"}), 404
    return jsonify({"success": True, "data": record})