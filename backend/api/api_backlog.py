from flask import Blueprint, request, jsonify
from models.backlog_box import BacklogBox
from engine.storage_backlog import get_backlogbox_by_folder, save_backlogbox, get_backlogbox_by_id, get_all_backlogboxes
from engine.storage_folder import get_folder_by_id
from engine.storage_user import get_user_by_id

from utils.auth import (
    require_auth,
    get_current_user_object
)

from engine.extensions import supabase
import uuid
import re
import unicodedata

def _sanitize_filename(filename: str) -> str:
    normalized = unicodedata.normalize("NFKD", filename)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    clean      = re.sub(r"[^\w\.\-]", "_", ascii_name)
    clean      = re.sub(r"_+", "_", clean).strip("_")
    return clean if clean else "file"

api_backlog = Blueprint("api_backlog", __name__, url_prefix="/api")

# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: FETCH / LAZY-INITIALIZE CHAT STREAMS
# ─────────────────────────────────────────────────────────────────────────────
@api_backlog.route("/backlog/folder/<string:folder_id>", methods=["GET"])
@require_auth
def get_or_create_chat(folder_id):
    current_user = get_current_user_object()

    try:
        folder = get_folder_by_id(folder_id)
        if not folder:
            return jsonify({"success": False, "error": "Dossier introuvable."}), 404

        # RBAC — company can only access folders linked to their phone
        if current_user.role == "company" and folder.company_phone != current_user.user_id:
            return jsonify({"success": False, "error": "Accès refusé — ce dossier ne vous appartient pas."}), 403

        box = get_backlogbox_by_folder(folder_id)

        if not box:
            company_phone_ref = (
                current_user.user_id          # company → their own phone
                if current_user.role == "company"
                else folder.company_phone or ""  # admin/agent → folder's company_phone
            )

            if not company_phone_ref:
                return jsonify({"success": False, "error": "Téléphone de la société manquant sur ce dossier."}), 400

            box = BacklogBox(
                folder_id  = folder_id,
                created_by = current_user.user_id,
                company_id = company_phone_ref,
            )
            save_backlogbox(box)

        return jsonify({"success": True, "data": box.to_dict()}), 200

    except Exception as exc:
        return jsonify({"success": False, "error": f"Erreur initialisation messagerie : {exc}"}), 500


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: APPEND CHAT MESSAGE BLOCK
# ─────────────────────────────────────────────────────────────────────────────
@api_backlog.route("/backlog/<string:backlogbox_id>", methods=["POST"])
@require_auth
def post_chat_message(backlogbox_id):
    current_user = get_current_user_object()

    try:
        # Support both JSON and multipart/form-data
        if request.content_type and "application/json" in request.content_type:
            data    = request.get_json() or {}
            content = data.get("content", "").strip()
            file    = None
        else:
            data    = request.form
            content = data.get("content", "").strip()
            file    = request.files.get("file")

        if not content and not file:
            return jsonify({"success": False, "error": "Le message ne peut pas être vide."}), 400

        box = get_backlogbox_by_id(backlogbox_id)
        if not box:
            return jsonify({"success": False, "error": "Salle de messagerie introuvable — initialisez d'abord le chat."}), 404

        # RBAC — company can only post in their own boxes
        if current_user.role == "company" and box.company_id != current_user.user_id:
            return jsonify({"success": False, "error": "Accès refusé — vous n'êtes pas autorisé à écrire dans cette conversation."}), 403

        # Handle file upload
        file_url  = None
        file_name = None
        if file and file.filename:
            try:
                safe_name  = _sanitize_filename(file.filename)
                filename   = f"backlog/{backlogbox_id}/{uuid.uuid4()}_{safe_name}"
                file_bytes = file.read()
                supabase.storage.from_("documents").upload(
                    path=filename,
                    file=file_bytes,
                    file_options={"content-type": file.content_type or "application/octet-stream"}
                )
                file_url  = supabase.storage.from_("documents").get_public_url(filename)
                file_name = file.filename
            except Exception as exc:
                return jsonify({"success": False, "error": f"Échec de l'upload du fichier : {exc}"}), 500

        box.add_message(
            content     = content or "",
            sender_id   = current_user.user_id,
            sender_type = current_user.role,
            file_url    = file_url,
            file_name   = file_name,
        )
        save_backlogbox(box)

        return jsonify({"success": True, "data": box.to_dict()}), 201

    except ValueError as exc:
        return jsonify({"success": False, "error": f"Données invalides : {exc}"}), 400
    except Exception as exc:
        return jsonify({"success": False, "error": f"Erreur envoi message : {exc}"}), 500


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: RETRIEVE ALL BACKLOG BOXES BASED ON USER ROLE
# ─────────────────────────────────────────────────────────────────────────────
@api_backlog.route("/backlogs", methods=["GET"])
@require_auth
def get_user_backlogboxes():
    current_user = get_current_user_object()

    try:
        all_boxes = get_all_backlogboxes()

        if current_user.role == "admin":
            # Admin → all boxes
            return jsonify({"success": True, "data": all_boxes}), 200

        if current_user.role == "agent":
            # Agent → all boxes (same as admin for messaging)
            return jsonify({"success": True, "data": all_boxes}), 200

        if current_user.role == "company":
            # Company → only boxes where company_id = their user_id (phone)
            filtered = [
                b for b in all_boxes
                if b.get("company_id") == current_user.user_id
            ]
            return jsonify({"success": True, "data": filtered}), 200

        return jsonify({"success": False, "error": "Rôle non reconnu."}), 403

    except Exception as exc:
        return jsonify({"success": False, "error": f"Erreur récupération messagerie : {exc}"}), 500