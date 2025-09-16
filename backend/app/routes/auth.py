from flask import Blueprint, request, jsonify
from app.database import db
from app.models.usuario import Usuario
from app.schemas.usuario import RegistroSchema, LoginSchema
from app.utils.jwt_utils import gerar_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    schema = RegistroSchema()
    errors = schema.validate(data)
    if errors:
        return jsonify(errors), 400

    if Usuario.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "E-mail já registrado"}), 400

    user = Usuario(nome=data["nome"], email=data["email"], role=data["role"])
    user.set_senha(data["senha"])
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Usuário registrado com sucesso"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    schema = LoginSchema()
    errors = schema.validate(data)
    if errors:
        return jsonify(errors), 400

    user = Usuario.query.filter_by(email=data["email"]).first()
    if not user or not user.verificar_senha(data["senha"]):
        return jsonify({"error": "Credenciais inválidas"}), 401

    token = gerar_token(user)
    return jsonify({
        "token": token,
        "usuario": {"id": user.id, "nome": user.nome, "email": user.email, "role": user.role}
    }), 200
