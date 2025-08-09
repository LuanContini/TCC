from flask import Blueprint


atendimentos_bp = Blueprint('atendimentos', __name__, url_prefix='/atendimentos')

@atendimentos_bp.route('/', methods=['GET'])
def listar_atendimentos():
    return "Listar todos os atendimentos"

@atendimentos_bp.route('/<int:id>', methods=['GET'])
def get_atendimento(id):
    return f"Detalhes do atendimento {id}"

@atendimentos_bp.route('/', methods=['POST'])
def criar_atendimento():
    return "Criar novo atendimento"

@atendimentos_bp.route('/<int:id>', methods=['PUT'])
def atualizar_atendimento(id):
    return f"Atualizar atendimento {id}"

@atendimentos_bp.route('/<int:id>', methods=['DELETE'])
def deletar_atendimento(id):
    return f"Deletar atendimento {id}"
