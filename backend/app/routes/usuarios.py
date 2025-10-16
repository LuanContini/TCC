from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.usuario import Usuario, db
from app.schemas.usuario import UsuarioSchema
from app.utils.jwt_utils import gerar_token, login_required, role_required
import re

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

usuario_schema = UsuarioSchema()
usuarios_schema = UsuarioSchema(many=True)

# ---------- REGISTRAR USUÁRIO ----------
@usuarios_bp.route("/registrar", methods=["POST"])
@login_required
@role_required("admin")
def registrar_usuario():
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({"error": "Dados JSON são obrigatórios"}), 400
        
        # Validar dados
        usuario_data = usuario_schema.load(dados)
        
        # Verificar se email já existe
        if Usuario.query.filter_by(email=usuario_data['email']).first():
            return jsonify({"error": "Email já cadastrado"}), 409
        
        # Criar novo usuário
        novo_usuario = Usuario(
            nome=usuario_data['nome'],
            email=usuario_data['email'],
            role=usuario_data['role']
        )
        
        # Definir senha (será hashada automaticamente)
        novo_usuario.set_senha(usuario_data['senha'])
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        # Retornar dados sem a senha
        return jsonify(usuario_schema.dump(novo_usuario)), 201
        
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detalhes": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao registrar usuário: {str(e)}"}), 500

# ---------- LOGIN ----------
@usuarios_bp.route("/login", methods=["POST"])
def login():
    try:
        dados = request.get_json()
        
        if not dados or 'email' not in dados or 'senha' not in dados:
            return jsonify({"error": "Email e senha são obrigatórios"}), 400
        
        email = dados['email'].strip().lower()
        senha = dados['senha']
        
        # Buscar usuário
        usuario = Usuario.query.filter_by(email=email).first()
        
        if not usuario or not usuario.verificar_senha(senha):
            return jsonify({"error": "Credenciais inválidas"}), 401
        
        # Gerar token JWT
        token = gerar_token(usuario)
        
        return jsonify({
            "mensagem": "Login realizado com sucesso",
            "token": token,
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "role": usuario.role
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro ao realizar login: {str(e)}"}), 500

# ---------- LISTAR TODOS OS USUÁRIOS ----------
@usuarios_bp.route("", methods=["GET"])
@login_required
@role_required("admin")
def listar_usuarios():
    try:
        usuarios = Usuario.query.all()
        return jsonify(usuarios_schema.dump(usuarios)), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao listar usuários: {str(e)}"}), 500

# ---------- OBTER USUÁRIO POR ID ----------
@usuarios_bp.route("/<int:id>", methods=["GET"])
@login_required
def obter_usuario(id):
    try:
        usuario = Usuario.query.get(id)
        
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Usuários só podem ver seus próprios dados, a menos que sejam admin
        if request.usuario_id != id and request.usuario_role != "admin":
            return jsonify({"error": "Acesso negado"}), 403
        
        return jsonify(usuario_schema.dump(usuario)), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar usuário: {str(e)}"}), 500

# ---------- ATUALIZAR USUÁRIO ----------
@usuarios_bp.route("/<int:id>", methods=["PUT"])
@login_required
def atualizar_usuario(id):
    try:
        usuario = Usuario.query.get(id)
        
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Verificar permissões
        if request.usuario_id != id and request.usuario_role != "admin":
            return jsonify({"error": "Acesso negado"}), 403
        
        dados = request.get_json()
        
        # Se não for admin, não pode alterar role
        if request.usuario_role != "admin" and 'role' in dados:
            return jsonify({"error": "Não autorizado a alterar permissões"}), 403
        
        # Validar dados (parcialmente para atualização)
        usuario_data = usuario_schema.load(dados, partial=True)
        
        # Verificar se email já existe (exceto para o próprio usuário)
        if 'email' in usuario_data:
            existing = Usuario.query.filter(
                Usuario.email == usuario_data['email'],
                Usuario.id != id
            ).first()
            if existing:
                return jsonify({"error": "Email já está em uso"}), 409
        
        # Atualizar campos
        for campo, valor in usuario_data.items():
            if campo == 'senha':
                usuario.set_senha(valor)
            else:
                setattr(usuario, campo, valor)
        
        db.session.commit()
        
        return jsonify(usuario_schema.dump(usuario)), 200
        
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detalhes": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar usuário: {str(e)}"}), 500

# ---------- DELETAR USUÁRIO ----------
@usuarios_bp.route("/<int:id>", methods=["DELETE"])
@login_required
@role_required("admin")
def deletar_usuario(id):
    try:
        usuario = Usuario.query.get(id)
        
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Não permitir que admin se delete
        if request.usuario_id == id:
            return jsonify({"error": "Não é possível deletar seu próprio usuário"}), 400
        
        db.session.delete(usuario)
        db.session.commit()
        
        return jsonify({
            "mensagem": f"Usuário {id} deletado com sucesso",
            "id": id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao deletar usuário: {str(e)}"}), 500

# ---------- ALTERAR SENHA ----------
@usuarios_bp.route("/<int:id>/alterar-senha", methods=["PUT"])
@login_required
def alterar_senha(id):
    try:
        usuario = Usuario.query.get(id)
        
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Verificar permissões
        if request.usuario_id != id and request.usuario_role != "admin":
            return jsonify({"error": "Acesso negado"}), 403
        
        dados = request.get_json()
        
        if not dados or 'senha_atual' not in dados or 'nova_senha' not in dados:
            return jsonify({"error": "Senha atual e nova senha são obrigatórias"}), 400
        
        # Se não for admin, verificar senha atual
        if request.usuario_role != "admin":
            if not usuario.verificar_senha(dados['senha_atual']):
                return jsonify({"error": "Senha atual incorreta"}), 401
        
        # Validar nova senha
        try:
            usuario_schema.fields['senha'].validate(dados['nova_senha'])
        except ValidationError as err:
            return jsonify({"error": "Nova senha inválida", "detalhes": err.messages}), 400
        
        # Definir nova senha
        usuario.set_senha(dados['nova_senha'])
        db.session.commit()
        
        return jsonify({"mensagem": "Senha alterada com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao alterar senha: {str(e)}"}), 500

# ---------- OBTER PERFIL DO USUÁRIO LOGADO ----------
@usuarios_bp.route("/perfil", methods=["GET"])
@login_required
def obter_perfil():
    try:
        usuario = Usuario.query.get(request.usuario_id)
        
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        return jsonify(usuario_schema.dump(usuario)), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar perfil: {str(e)}"}), 500