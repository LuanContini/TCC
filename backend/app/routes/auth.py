from flask import Blueprint, request, jsonify
from app.database import db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioSchema, LoginSchema
from app.utils.jwt_utils import gerar_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

usuario_schema = UsuarioSchema()
login_schema = LoginSchema()

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados JSON são obrigatórios"}), 400
        
        # Validar dados com o schema
        errors = usuario_schema.validate(data)
        if errors:
            return jsonify({"error": "Dados inválidos", "detalhes": errors}), 400

        # Verificar se email já existe
        if Usuario.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "E-mail já registrado"}), 400

        # Criar usuário
        user = Usuario(
            nome=data["nome"], 
            email=data["email"], 
            role=data["role"]
        )
        user.set_senha(data["senha"])
        
        db.session.add(user)
        db.session.commit()

        # Gerar token para login automático após registro
        token = gerar_token(user)
        
        return jsonify({
            "message": "Usuário registrado com sucesso",
            "token": token,
            "usuario": {
                "id": user.id,
                "nome": user.nome,
                "email": user.email,
                "role": user.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados JSON são obrigatórios"}), 400
        
        # Validar dados com o schema de login
        errors = login_schema.validate(data)
        if errors:
            return jsonify({"error": "Dados inválidos", "detalhes": errors}), 400

        # Buscar usuário
        user = Usuario.query.filter_by(email=data["email"]).first()
        
        # Verificar credenciais
        if not user or not user.verificar_senha(data["senha"]):
            return jsonify({"error": "Credenciais inválidas"}), 401

        # Gerar token JWT
        token = gerar_token(user)
        
        return jsonify({
            "message": "Login realizado com sucesso",
            "token": token,
            "usuario": {
                "id": user.id,
                "nome": user.nome,
                "email": user.email,
                "role": user.role
            }
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Rota para verificar token (opcional)
@auth_bp.route("/verify", methods=["POST"])
def verify_token():
    try:
        data = request.get_json()
        
        if not data or "token" not in data:
            return jsonify({"error": "Token é obrigatório"}), 400
            
        # Aqui você pode adicionar a lógica para verificar o token
        # usando suas funções JWT existentes
        
        return jsonify({"valid": True, "message": "Token válido"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro ao verificar token: {str(e)}"}), 500

# Rota para obter informações do usuário atual (opcional)
@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    try:
        # Esta rota precisaria ser protegida com o decorator @login_required
        # e extrair as informações do usuário do token JWT
        
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token não fornecido"}), 401
            
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        
        # Usar suas funções JWT para verificar o token e obter o usuário
        # usuario_info = verificar_token(token)
        # user = Usuario.query.get(usuario_info["id"])
        
        # return jsonify(usuario_schema.dump(user)), 200
        return jsonify({"error": "Funcionalidade não implementada"}), 501
        
    except Exception as e:
        return jsonify({"error": f"Erro ao obter informações do usuário: {str(e)}"}), 500