from flask import Blueprint, request, jsonify
from app.models import Paciente, db
from utils.facial_recognition import register_face
import os
from werkzeug.utils import secure_filename
from utils.error_handler import ValidationError

pacientes_bp = Blueprint('pacientes', __name__, url_prefix='/pacientes')

UPLOAD_FOLDER = "uploads/faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


#GET
@pacientes_bp.route("/", methods=["GET"])
def listar_pacientes():
    raise ValidationError("o campo nome é obrigatorio")

@pacientes_bp.route("/<int:id>", methods=["GET"])
def get_paciente(id):
    return f"Detalhes do paciente {id}"

#POST
@pacientes_bp.route('/', methods=['POST'])
def criar_paciente():
    nome = request.form.get("nome")
    cpf = request.form.get("cpf")
    foto = request.files.get("foto")

    if not nome or not cpf or not foto:
        raise ValidationError("Nome, CPF e foto são obrigatórios", 400)

    # Salvar paciente no banco
    paciente = Paciente(nome=nome, cpf=cpf)
    db.session.add(paciente)
    db.session.commit()

    # Salvar foto temporariamente
    filename = secure_filename(f"{paciente.id}_{foto.filename}")
    foto_path = os.path.join(UPLOAD_FOLDER, filename)
    foto.save(foto_path)

    try:
        # Criar embedding e salvar no FAISS
        register_face(foto_path, paciente.id)
    except Exception as e:
        db.session.delete(paciente)
        db.session.commit()
        os.remove(foto_path)
        raise ValidationError(f"Erro no processamento da foto: {str(e)}", 400)

    return jsonify({
        "status": "success",
        "message": "Paciente cadastrado com sucesso",
        "paciente_id": paciente.id
    }), 201


@pacientes_bp.route("/<int:id>", methods=["PUT"])
def atualizar_paciente(id):
    return f"Atualizar paciente {id}"


@pacientes_bp.route("/<int:id>", methods=["DELETE"])
def deletar_paciente(id):
    return f"Deletar paciente {id}"
