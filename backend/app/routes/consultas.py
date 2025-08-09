from flask import Blueprint

consultas_bp = Blueprint('consultas', __name__, url_prefix='/consultas')

@consultas_bp.route('/', methods=['GET'])
def listar_consultas():
    return "Listar todas as consultas"

@consultas_bp.route('/<int:id>', methods=['GET'])
def get_consulta(id):
    return f"Detalhes da consulta {id}"

@consultas_bp.route('/', methods=['POST'])
def criar_consulta():
    return "Criar nova consulta"

@consultas_bp.route('/<int:id>', methods=['PUT'])
def atualizar_consulta(id):
    return f"Atualizar consulta {id}"

@consultas_bp.route('/<int:id>', methods=['DELETE'])
def deletar_consulta(id):
    return f"Deletar consulta {id}"
