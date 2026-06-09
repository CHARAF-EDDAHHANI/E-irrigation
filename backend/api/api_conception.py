from flask import Blueprint, request, jsonify
from datetime import datetime, timezone

from models.conception_calculator import run_calculations
from engine.storage_conception import (
    save_conception,
    get_all_conceptions,
    get_conception_by_id,
    get_conceptions_by_folder,
    delete_conception,
    delete_conceptions_by_folder,
)

api_conception = Blueprint("api_conception", __name__, url_prefix="/api")

# ─────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────
@api_conception.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "conceptions_count": len(get_all_conceptions()),
    })


# ─────────────────────────────────────────
# CALCULATE (UNCHANGED)
# ─────────────────────────────────────────
@api_conception.route("/calculate", methods=["POST"])
def calculate():
    try:
        payload = request.get_json(force=True)

        if not payload.get("folder_id"):
            return jsonify({
                "success": False,
                "error": "folder_id obligatoire"
            }), 400

        results = run_calculations(payload)

        return jsonify({
            "success": True,
            "results": results
        })

    except Exception as exc:
        return jsonify({
            "success": False,
            "error": str(exc)
        }), 400


# ─────────────────────────────────────────
# SAVE (UPSERT = CREATE OR UPDATE)
# ─────────────────────────────────────────
@api_conception.route("/conceptions/save", methods=["POST"])
def save():
    try:
        body = request.get_json(force=True)

        folder_id  = body.get("folder_id", "").strip()
        input_data  = body.get("input", {})
        results     = body.get("results")

        if not folder_id:
            return jsonify({
                "success": False,
                "error": "folder_id obligatoire"
            }), 400

        if results is None:
            return jsonify({
                "success": False,
                "error": "results obligatoire"
            }), 400

        #CORE RULE: 1 folder = 1 conception
        record = save_conception(
            folder_id=folder_id,
            input_data=input_data,
            results=results
        )

        return jsonify({
            "success": True,
            "action": "updated_or_created",
            "conception_id": record["conception_id"],
            "data": record
        })

    except Exception as exc:
        return jsonify({
            "success": False,
            "error": str(exc)
        }), 400


# ─────────────────────────────────────────
# GET BY FOLDER (ONLY ONE EXPECTED)
# ─────────────────────────────────────────
@api_conception.route("/conceptions/<folder_id>", methods=["GET"])
def get_by_folder(folder_id):
    records = get_conceptions_by_folder(folder_id)

    if not records:
        return jsonify({
            "success": False,
            "error": "Aucune conception trouvée"
        }), 404

    return jsonify({
        "success": True,
        "data": records[0]   # only one now
    })


# ─────────────────────────────────────────
# GET BY ID
# ─────────────────────────────────────────
@api_conception.route("/conceptions/<conception_id>", methods=["GET"])
def get_conception(conception_id):
    record = get_conception_by_id(conception_id)

    if not record:
        return jsonify({
            "success": False,
            "error": "Conception introuvable"
        }), 404

    return jsonify({
        "success": True,
        "data": record
    })


# ─────────────────────────────────────────
# DELETE SINGLE
# ─────────────────────────────────────────
@api_conception.route("/conceptions/<conception_id>", methods=["DELETE"])
def delete(conception_id):
    ok = delete_conception(conception_id)

    if not ok:
        return jsonify({
            "success": False,
            "error": "Conception introuvable"
        }), 404

    return jsonify({
        "success": True,
        "message": "Conception supprimée"
    })


# ─────────────────────────────────────────
# DELETE BY FOLDER
# ─────────────────────────────────────────
@api_conception.route("/conceptions/folder/<folder_id>", methods=["DELETE"])
def delete_folder(folder_id):
    deleted = delete_conceptions_by_folder(folder_id)

    return jsonify({
        "success": True,
        "deleted": deleted
    })