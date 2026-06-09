import os  # Standard library to interact with the Operating System (needed to read .env variables)
from flask import Flask  # Core Flask framework to create the web application
from flask_cors import CORS  # Extension to handle Cross-Origin Resource Sharing (CORS)

# Import blueprint routes from the local API modules
from api.api_conception import api_conception
from api.api_folder import api_folder
from api.api_user import api_user
from api.api_backlog import api_backlog
from dotenv import load_dotenv  # Module to load environment variables from a .env file

# Load environment variables from the backend/.env file into the system environment
load_dotenv()

# Safely extract secret variables from the environment without hardcoding them in the code
SECRET_KEY = os.getenv("SECRET_KEY")

# Extract the network port from the environment, converting it to an integer.
# If no PORT is specified in the .env file, it safely defaults to 5000.
PORT = int(os.getenv("PORT", 5000))

# Initialize the main Flask application instance
app = Flask(__name__)

# Assign the secret key to the Flask configuration for session management and token security
app.config["SECRET_KEY"] = SECRET_KEY

# Configure Cross-Origin Resource Sharing (CORS)
# This allows your Vite frontend (running on port 5173) to securely send requests to this backend.
# 'supports_credentials=True' is critical if your application shares cookies or authorization headers.
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "https://e-irrigation-ormvam.netlify.app"
    ])

# Register the API blueprints to mount the application routes from different modules
app.register_blueprint(api_conception)
app.register_blueprint(api_folder)
app.register_blueprint(api_user)
app.register_blueprint(api_backlog)

# Execution block: Only runs the local server if this script is executed directly (python server.py)
if __name__ == "__main__":
    # Start the Flask development server
    # 'host="0.0.0.0"' makes the server accessible from any device on your local network
    # 'port=PORT' dynamically binds to the port fetched from your configuration
    # 'debug=True' auto-reloads the server whenever you save code changes during development
    app.run(host="0.0.0.0", port=PORT, debug=True)
