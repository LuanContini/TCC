from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.profissional import Profissional, db
from app.schemas.profissional import ProfissionalSchema
from datetime import datetime
from app.utils.jwt_utils import login_required, role_required

profissionais_bp = Blueprint('profissionais', __name__, url_prefix='/profissionais')

profissional_schema = ProfissionalSchema()
profissionais_schema = ProfissionalSchema(many=True)

# ---------- LISTAR TODOS (apenas precisa estar logado) ----------
@profissionais_bp.route('', methods=['GET'])
@login_required
def listar_profissionais():
    usuario_id = request.usuario_id 
    profissionais = Profissional.query.all()
    return jsonify(profissionais_schema.dump(profissionais)), 200


# ---------- DETALHE POR ID (apenas precisa estar logado) ----------
@profissionais_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_profissional(id):
    usuario_id = request.usuario_id  
    profissional = Profissional.query.get_or_404(id)
    return jsonify(profissional_schema.dump(profissional)), 200


# ---------- CRIAR (apenas admin) ----------
@profissionais_bp.route('', methods=['POST'])
@login_required
@role_required("admin")
def criar_profissional():
    usuario_id = request.usuario_id  
    try:
        dados = profissional_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    novo = Profissional(**dados)
    db.session.add(novo)
    db.session.commit()

    return jsonify(profissional_schema.dump(novo)), 201


# ---------- ATUALIZAR (apenas admin) ----------
@profissionais_bp.route('/<int:id>', methods=['PUT'])
@login_required
@role_required("admin")
def atualizar_profissional(id):
    usuario_id = request.usuario_id
    profissional = Profissional.query.get_or_404(id)

    try:
        dados = profissional_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for campo, valor in dados.items():
        setattr(profissional, campo, valor)

    profissional.atualizadoEm = datetime.utcnow()
    db.session.commit()

    return jsonify(profissional_schema.dump(profissional)), 200


# ---------- DELETAR (apenas admin) ----------
@profissionais_bp.route('/<int:id>', methods=['DELETE'])
@login_required
@role_required("admin")
def deletar_profissional(id):
    usuario_id = request.usuario_id
    profissional = Profissional.query.get_or_404(id)
    db.session.delete(profissional)
    db.session.commit()
    return jsonify({"mensagem": f"Profissional {id} deletado com sucesso"}), 200


@profissionais_bp.route('/<int:id>', methods=['PATCH'])
@login_required
@role_required("admin")
def atualizar_parcial_profissional(id):
    usuario_id = request.usuario_id
    profissional = Profissional.query.get_or_404(id)

    try:
        dados = request.get_json()
        
        for campo, valor in dados.items():
            if hasattr(profissional, campo) and campo not in ['idProfissional', 'criadoEm']:
                setattr(profissional, campo, valor)

        profissional.atualizadoEm = datetime.utcnow()
        db.session.commit()

        return jsonify(profissional_schema.dump(profissional)), 200
        
    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao atualizar profissional: {str(e)}"}), 500