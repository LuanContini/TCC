from flask import Blueprint

profissionais_bp = Blueprint('profissionais', __name__, url_prefix='/profissionais')

@profissionais_bp.route('/', methods=['GET'])
def listar_profissionais():
    return "Listar todos os profissionais"

@profissionais_bp.route('/<int:id>', methods=['GET'])
def get_profissional(id):
    return f"Detalhes do profissional {id}"

@profissionais_bp.route('/', methods=['POST'])
def criar_profissional():
    return "Criar novo profissional"

@profissionais_bp.route('/<int:id>', methods=['PUT'])
def atualizar_profissional(id):
    return f"Atualizar profissional {id}"

@profissionais_bp.route('/<int:id>', methods=['DELETE'])
def deletar_profissional(id):
    return f"Deletar profissional {id}"
