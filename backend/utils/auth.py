"""
pswd hash bcrypt
pswd verif
jwt token generate
jwt token verife
cookies-based auth
"""
import bcrypt
import jwt
import datetime
from flask import request, current_app, jsonify, g
from functools import wraps
from engine.storage_user import get_user_by_id

#pass hashing

def encrypt_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=5)
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")

def compare_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception as err:
        print("Password compare error:", str(err))
        return False

#jwt handling
def generate_token(user_id, email=None, role=None):
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }

    return jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

def verify_token(token):
    try:
        decoded = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        return decoded
    except jwt.ExpiredSignatureError:
            return None
    except jwt.InvalidTokenError:
            return None

# COOKIE handling
def get_current_user():
    """extrect user from HttpOnly cookie"""
    token = request.cookies.get("auth_token")
    
    if not token:
        return None

    decoded = verify_token(token)
    if not decoded:
        return None
    
    return decoded["user_id"]


def get_current_user_object():
    user_id = get_current_user()
    if not user_id:
        return None
    return get_user_by_id(user_id)


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = get_current_user()
        if not user_id:
            return jsonify({"message": "Vous n'avez pas pu Creer le compte, problem d'Authentification, Contactez le support Technique Affin de Resoudre le problem "}), 401
        
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"message": "user not found"}), 401

        g.current_user = user
        return f(*args, **kwargs)
    return wrapper

def require_role(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user_id = get_current_user()
            user = get_user_by_id(user_id)

            if not user or user.role !=role:
                return jsonify({"message": "Forbidden"}), 403
            
            return f(*args, **kwargs)
        return wrapper
    return decorator