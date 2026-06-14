import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SUPABASE_URL = os.environ.get("REACT_APP_SUPABASE_URL") # Matches frontend key to avoid duplicate env variables
    SUPABASE_KEY = os.environ.get("REACT_APP_SUPABASE_ANON_KEY") # Matches frontend key to avoid duplicate env variables
