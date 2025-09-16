from flask import request, jsonify
from .pacientes import pacientes_bp
from .profissionais import profissionais_bp
from .agendamentos import agendamentos_bp
from .atendimentos import atendimentos_bp
from .auth import auth_bp
from app.utils.jwt_utils import verificar_token

def register_routes(app):
    # Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(pacientes_bp)
    app.register_blueprint(profissionais_bp)
    app.register_blueprint(agendamentos_bp)
    app.register_blueprint(atendimentos_bp)

    @app.before_request
    def proteger_rotas():
        if request.path in ["/auth/login", "/auth/register"]:
            return  # libera login e registro

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token não fornecido"}), 401
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"error": "Formato do token inválido"}), 401

        usuario = verificar_token(token)
        if not usuario:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        request.usuario_id = usuario["id"]
        request.usuario_role = usuario["role"]
