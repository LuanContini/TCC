from flask import Blueprint

pacientes_bp = Blueprint('pacientes', __name__, url_prefix='/pacientes')

@pacientes_bp.route('/', methods=['GET'])
def listar_pacientes():
    return "Listar todos os pacientes"

@pacientes_bp.route('/<int:id>', methods=['GET'])
def get_paciente(id):
    return f"Detalhes do paciente {id}"

@pacientes_bp.route('/', methods=['POST'])
def criar_paciente():
    return "Criar novo paciente"

@pacientes_bp.route('/<int:id>', methods=['PUT'])
def atualizar_paciente(id):
    return f"Atualizar paciente {id}"

@pacientes_bp.route('/<int:id>', methods=['DELETE'])
def deletar_paciente(id):
    return f"Deletar paciente {id}"
