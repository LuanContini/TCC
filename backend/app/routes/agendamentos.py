from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from datetime import datetime
from app.database import db
from app.models.agendamento import Agendamento
from app.schemas.agendamentos import AgendamentoSchema
from app.utils.jwt_utils import login_required, role_required

agendamentos_bp = Blueprint('agendamentos', __name__, url_prefix='/agendamentos')

agendamento_schema = AgendamentoSchema()
agendamentos_schema = AgendamentoSchema(many=True)

# ---------- LISTAR ----------
@agendamentos_bp.route('', methods=['GET'])
@login_required
def listar_agendamentos():
    ags = Agendamento.query.all()
    return jsonify(agendamentos_schema.dump(ags)), 200

# ---------- DETALHE ----------
@agendamentos_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_agendamento(id):
    ag = Agendamento.query.get_or_404(id)
    return jsonify(agendamento_schema.dump(ag)), 200

# ---------- CRIAR ----------
@agendamentos_bp.route('', methods=['POST'])
@login_required
@role_required("admin")
def criar_agendamento():
    try:
        dados = agendamento_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    novo = Agendamento(**dados)
    db.session.add(novo)
    db.session.commit()

    return jsonify(agendamento_schema.dump(novo)), 201

# ---------- ATUALIZAR ----------
@agendamentos_bp.route('/<int:id>', methods=['PUT'])
@login_required
@role_required("admin")
def atualizar_agendamento(id):
    ag = Agendamento.query.get_or_404(id)

    try:
        dados = agendamento_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for campo, valor in dados.items():
        setattr(ag, campo, valor)

    ag.atualizadoEm = datetime.utcnow()
    db.session.commit()

    return jsonify(agendamento_schema.dump(ag)), 200

# ---------- DELETAR ----------
@agendamentos_bp.route('/<int:id>', methods=['DELETE'])
@login_required
@role_required("admin")
def deletar_agendamento(id):
    ag = Agendamento.query.get_or_404(id)
    db.session.delete(ag)
    db.session.commit()
    return jsonify({"mensagem": f"Agendamento {id} deletado com sucesso"}), 200
