import os
from flask import Flask
from flask_cors import CORS  
from api.api_conception import api_conception
from api.api_folder import api_folder
from api.api_user import api_user
from api.api_backlog import api_backlog
from dotenv import load_dotenv
from engine.extensions import db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
PORT = int(os.getenv("PORT", 5000))

app = Flask(__name__)

app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
with app.app_context():
    from engine.db_folder import FolderDB
    from engine.db_document import DocumentDB
    from engine.db_user import UserDB
    from engine.db_backlog import BacklogBoxDB
    from engine.db_conception import ConceptionDB
    db.create_all()

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "https://e-irrigation-ormvam.netlify.app"
    ])

app.register_blueprint(api_conception)
app.register_blueprint(api_folder)
app.register_blueprint(api_user)
app.register_blueprint(api_backlog)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)