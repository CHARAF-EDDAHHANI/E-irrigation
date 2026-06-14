from flask_sqlalchemy import SQLAlchemy
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)