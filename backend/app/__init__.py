from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from .database import init_db, db
from .routes import register_routes
from .utils.error_handler import register_error_handlers
import os

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Inicializa DB
    init_db(app)

    # Configura JWT
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    jwt.init_app(app)

    # Configura CORS
    CORS(
            app,
            resources={r"/*": {"origins": "http://localhost:5173"}},
            supports_credentials=True,
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )
    # Rotas e handlers
    register_routes(app)
    register_error_handlers(app)

    return app
