# routes/profissionais.py
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.profissional import Profissional, db
from app.schemas.profissional import ProfissionalSchema
from datetime import datetime

profissionais_bp = Blueprint('profissionais', __name__, url_prefix='/profissionais')

profissional_schema = ProfissionalSchema()
profissionais_schema = ProfissionalSchema(many=True)


# LISTAR TODOS
@profissionais_bp.route('', methods=['GET'])
def listar_profissionais():
    profissionais = Profissional.query.all()
    return jsonify(profissionais_schema.dump(profissionais)), 200


# DETALHE POR ID
@profissionais_bp.route('/<int:id>', methods=['GET'])
def get_profissional(id):
    profissional = Profissional.query.get_or_404(id)
    return jsonify(profissional_schema.dump(profissional)), 200


# CRIAR
@profissionais_bp.route('', methods=['POST'])
def criar_profissional():
    try:
        dados = profissional_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    novo = Profissional(**dados)
    db.session.add(novo)
    db.session.commit()

    return jsonify(profissional_schema.dump(novo)), 201


# ATUALIZAR
@profissionais_bp.route('/<int:id>', methods=['PUT'])
def atualizar_profissional(id):
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


# DELETAR
@profissionais_bp.route('/<int:id>', methods=['DELETE'])
def deletar_profissional(id):
    profissional = Profissional.query.get_or_404(id)
    db.session.delete(profissional)
    db.session.commit()
    return jsonify({"mensagem": f"Profissional {id} deletado com sucesso"}), 200
