"""
POST    /api/login      -> login + set cookie
GET     /api/auth/me    -> get current user from cookie
POST    /api/logout     -> clear cookie
POST    /api/register       -> create new user   
"""


from flask import Blueprint, request, jsonify, make_response
from models.user import User
from engine.storage_user import (
    get_user_by_email,
    get_user_by_id,
    save_user
)
from utils.auth import (
    encrypt_password,
    compare_password,
    generate_token,
    get_current_user,
    get_current_user_object,
    require_auth,
    require_role
)

api_user = Blueprint("api_user", __name__, url_prefix="/api")

#--------------
# REGISTER
#--------------

@api_user.route("/register", methods=["POST"])
@require_auth
def register():
    data = request.get_json()

    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    fullName = data.get("fullName","")
    role = data.get("role")
    phone = data.get("phone")
    national_id = data.get("national_id")


    if not email or not password or not role:
        return jsonify({"message":" les cases importantes manquent"}), 400
    

    current_user = get_current_user_object()

    #------RULES ENGINE------
    ROLE_RULES = {
        "admin": {"agent", "company", "farmer", "admin"},
        "agent": {"company", "farmer"},
        "company": {"farmer"},
    }

    allowed = ROLE_RULES.get(current_user.role, set())

    if role not in allowed:
        return jsonify({"message": "Désolé, vous ne disposez pas des droits nécessaires pour créer des agents"}), 403

#-----check existing user-------
    existing = get_user_by_email(email)
    if existing:
        return jsonify({"message":"Cette adresse email est déjà inscrite"}), 400

#-----create users--------
    hashed_password = encrypt_password(password)

    try:
        user= User(
            email=email,
            password=hashed_password,
            fullName=fullName,
            role=role,
            phone=phone,
            national_id=national_id
        )
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    save_user(user)

    return jsonify({
        "message": "Nous vous confirmons que votre compte a bien été créé. ",
        "user": user.to_dict()
    }), 201

#----------
#login
#----------
@api_user.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"message":"Merci de saisir vos identifiants de connexion."}),400

    user = get_user_by_email(email)

    if not user:
        return jsonify({"message":"Veuillez entrer une adresse email valide."}), 401

    if not compare_password(password, user.password):
        return jsonify({"message":"Identifiants incorrects. Veuillez réessayer."}), 401
    
    token = generate_token(
        user_id=user.user_id,
        email=user.email,
        role=user.role
    )

    #create response
    response = make_response(jsonify({
        "user": {
            "user_id": user.user_id,
            "role": user.role,
            "fullName": user.fullName,
        }
    }))

    #set cookie
    response.set_cookie(
        "auth_token",
        token,
        httponly=True,
        secure=False, #<<<<<<<TRUE in production HTTPS>>>>>>>>>>>>>>>
        samesite="Lax",
        max_age= 8 * 3600,
    )
    return response

#---------
#auth me ( check logged user )
#---------

@api_user.route("/auth/me", methods=["GET"])
@require_auth
def auth_me():
    user = get_current_user_object()

    return jsonify({
        "user_id": user.user_id,
        "role": user.role,
        "fullName": user.fullName,
    })

#---------
#LOGOUT
#---------

@api_user.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Vous êtes maintenant déconnecté."}))

    response.set_cookie(
        "auth_token",
        "",
        expires=0,
        httponly=True,
        samesite="Lax"
    )

    return response

#------------------
# GET USER BY ID
#------------------
@api_user.route("/users/<string:user_id>", methods=["GET"])
@require_auth
def get_user(user_id):
    """Retourne les informations publiques d'un utilisateur par son ID"""
    current_user = get_current_user_object()
    
    # Seul l'admin peut voir le profil de tout le monde.
    if current_user.role != "admin" and current_user.user_id != user_id:
        return jsonify({"message": "Désolé, vous n'avez pas l'autorisation de consulter ce profil"}), 403

    user = get_user_by_id(user_id)
    
    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    # On retourne le dictionnaire sécurisé (le mot de passe reste caché)
    return jsonify({
        "user": user.to_dict(hide_password=True)
    }), 200


