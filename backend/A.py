from engine.storage_user import save_user, get_user_by_email
from models.user import User
from utils.auth import encrypt_password


def create_admin():
    email = "admin@system.com"
    password = "Loubna@1997"
    fullName = "Administrateur"
    role = "admin"

    # avoid duplicates
    existing = get_user_by_email(email)
    if existing:
        print("❌ Admin already exists")
        return

    admin = User(
        email=email,
        password=encrypt_password(password),
        fullName=fullName,
        role=role
    )

    save_user(admin)

    print("✅ Admin created successfully")
    print("📧 email:", email)
    print("🔑 password:", password)


if __name__ == "__main__":
    create_admin()