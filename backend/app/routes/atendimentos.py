from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.atendimento import Atendimento, db
from app.schemas.atendimento import AtendimentoSchema
from datetime import datetime
from app.utils.jwt_utils import login_required, role_required

atendimentos_bp = Blueprint('atendimentos', __name__, url_prefix='/atendimentos')

atendimento_schema = AtendimentoSchema()
atendimentos_schema = AtendimentoSchema(many=True)

# ---------- LISTAR TODOS ----------
@atendimentos_bp.route('', methods=['GET'])
@login_required
def listar_atendimentos():
    atendimentos = Atendimento.query.all()
    return jsonify(atendimentos_schema.dump(atendimentos)), 200

# ---------- DETALHE ----------
@atendimentos_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_atendimento(id):
    atendimento = Atendimento.query.get_or_404(id)
    return jsonify(atendimento_schema.dump(atendimento)), 200

# ---------- CRIAR ----------
@atendimentos_bp.route('', methods=['POST'])
@login_required
@role_required("admin")
def criar_atendimento():
    try:
        dados = atendimento_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    novo = Atendimento(**dados)
    db.session.add(novo)
    db.session.commit()

    return jsonify(atendimento_schema.dump(novo)), 201

# ---------- ATUALIZAR ----------
@atendimentos_bp.route('/<int:id>', methods=['PUT'])
@login_required
@role_required("admin")
def atualizar_atendimento(id):
    atendimento = Atendimento.query.get_or_404(id)

    try:
        dados = atendimento_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for campo, valor in dados.items():
        setattr(atendimento, campo, valor)

    atendimento.atualizadoEm = datetime.utcnow()
    db.session.commit()

    return jsonify(atendimento_schema.dump(atendimento)), 200

# ---------- DELETAR ----------
@atendimentos_bp.route('/<int:id>', methods=['DELETE'])
@login_required
@role_required("admin")
def deletar_atendimento(id):
    atendimento = Atendimento.query.get_or_404(id)
    db.session.delete(atendimento)
    db.session.commit()
    return jsonify({"mensagem": f"Atendimento {id} deletado com sucesso"}), 200
