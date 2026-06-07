from flask import Blueprint, request, jsonify

# ─────────────────────────────────────────────────────────────────────────────
# PROPER ARCHITECTURAL IMPORTS USING YOUR LIVE MODULES
# ─────────────────────────────────────────────────────────────────────────────
from models.backlog_box import BacklogBox
from engine.storage_backlog import get_backlogbox_by_folder, save_backlogbox, get_backlogbox_by_id, get_all_backlogboxes
from engine.storage_folder import get_folder_by_id
from engine.storage_user import get_user_by_id

from utils.auth import (
    require_auth,
    get_current_user_object
)

api_backlog = Blueprint("api_backlog", __name__, url_prefix="/api")

# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: FETCH / LAZY-INITIALIZE CHAT STREAMS
# ─────────────────────────────────────────────────────────────────────────────
@api_backlog.route("/backlog/folder/<string:folder_id>", methods=["GET"])
@require_auth
def get_or_create_chat(folder_id):
    """
    Loads or initializes a discussion box when a user clicks 'Message'.
    Enforces active business authorization constraints against the live database.
    """
    current_user = get_current_user_object()
    
    # 1. Fetch the real folder record from your storage layer
    folder = get_folder_by_id(folder_id)
    if not folder:
        return jsonify({"success": False, "error": "Targeted folder record was not found."}), 404

    # Convert folder object to dict if it is stored as an instance model
    folder_data = folder.to_dict() if hasattr(folder, "to_dict") else folder

    # 2. Enforce Strict Security Boundaries (RBAC)
    # Admin has complete system access.
    # Agents can only access folders they explicitly created.
    if current_user.role == "agent" and folder_data.get("created_by") != current_user.user_id:
        return jsonify({"success": False, "error": "Access denied. Folder ownership mismatch."}), 403
        
    # Companies can only access if their profile name matches the folder company property
    if current_user.role == "company" and folder_data.get("company") != current_user.fullName:
        return jsonify({"success": False, "error": "Access denied. Restricted vendor access."}), 403

    # 3. Query message engine array for existing room records
    box = get_backlogbox_by_folder(folder_id)
    
    # 4. Lazy-creation loop: Initialize a new thread on the fly if it does not exist
    if not box:
        # If a company initiates the chat, use its phone number as the company_id pointer.
        # Otherwise, fall back to the designated default or retrieve it from the system user pool.
        company_phone_ref = current_user.phone if current_user.role == "company" else "+212519190990"
        
        box = BacklogBox(
            folder_id=folder_id,
            agent_id=folder_data.get("created_by"),
            company_id=company_phone_ref
        )
        save_backlogbox(box)

    return jsonify({"success": True, "data": box.to_dict()}), 200


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: APPEND CHAT MESSAGE BLOCK
# ─────────────────────────────────────────────────────────────────────────────
@api_backlog.route("/backlog/<string:backlogbox_id>", methods=["POST"])
@require_auth
def post_chat_message(backlogbox_id):
    """
    Appends a fresh message into a folder's embedded chat array.
    Automatically captures user identity strings from your secure auth cookie token.
    """
    current_user = get_current_user_object()
    data = request.get_json() or {}
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"success": False, "error": "Message content body cannot be empty."}), 400

    # Ensure the backlogbox was initialized first via the GET route click process
    box = get_backlogbox_by_id(backlogbox_id)
    if not box:
        return jsonify({"success": False, "error": "Active target room must be initialized first."}), 404

    # Enforce safe insertion by pushing directly into the embedded array method
    try:
        box.add_message(
            content=content,
            sender_id=current_user.user_id,  # Will accurately bind UUIDv4 strings or Company phone keys
            sender_type=current_user.role
        )
        save_backlogbox(box)
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

    return jsonify({"success": True, "data": box.to_dict()}), 201

# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: RETRIEVE ALL BACKLOG BOXES BASED ON USER ROLE
# ─────────────────────────────────────────────────────────────────────────────
@api_backlog.route("/backlogs", methods=["GET"])
@require_auth
def get_user_backlogboxes():
    """
    Retrieves and filters chat rooms (BacklogBoxes) based on the user's role.
    Admins see everything. Agents, companies, and farmers see their own rooms.
    """
    # 1. Capture secure user identity and role from the session token
    current_user = get_current_user_object()
    user_id = current_user.user_id
    user_role = getattr(current_user, "role", "").lower()  # Normalize role string (e.g., 'admin', 'agent')

    # 2. Fetch the full list of raw chat rooms from storage
    all_boxes = get_all_backlogboxes()
    user_boxes = []

    # 3. Apply role-based filtering logic
    for b in all_boxes:
        # ROLE: Admin -> Bypass all filters and grant total access
        if user_role == "admin":
            box_obj = BacklogBox.from_dict(b)
            user_boxes.append(box_obj.to_dict())
            continue

        is_participant = (
            b.get("agent_id") == user_id or 
            b.get("company_id") == user_id or 
            b.get("user_id") == user_id
        )
        
        if is_participant:
            user_boxes.append(b)

    return jsonify({
        "success": True, 
        "data": user_boxes
    }), 200
