from flask import Flask, request, Response
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from .database import init_db, db
from .routes import register_routes
from .utils.error_handler import register_error_handlers
from .models.usuario import Usuario
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

    # ✅ Libera preflight OPTIONS
    @app.before_request
    def liberar_preflight():
        if request.method == "OPTIONS":
            resp = Response()
            resp.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            return resp

    # Rotas e handlers
    register_routes(app)
    register_error_handlers(app)

    # --- Cria admin padrão ---
    with app.app_context():
        db.create_all()  # garante que todas as tabelas existam
        criar_admin_padrao()

    return app


def criar_admin_padrao():
    # verifica se o admin já existe
    if not Usuario.query.filter_by(email="admin@clinica.com").first():
        admin = Usuario(
            nome="Administrador",
            email="admin@clinica.com",
            role="admin"
        )
        # define senha segura
        admin.set_senha(os.getenv("ADMIN_PASSWORD", "senha_forte_aqui"))
        db.session.add(admin)
        db.session.commit()
        print("Admin padrão criado!")
