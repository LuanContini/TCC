from flask import Blueprint, request, jsonify
from app.models import Paciente, db
from app.utils.facial_recognition import register_face, recognize_face
import os
from werkzeug.utils import secure_filename
from app.utils.error_handler import ValidationError

pacientes_bp = Blueprint('pacientes', __name__, url_prefix='/pacientes')

UPLOAD_FOLDER = "uploads/faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# GET
@pacientes_bp.route("/", methods=["GET"])
def listar_pacientes():
    pacientes = Paciente.query.all()
    return jsonify([{"id": p.id, "nome": p.nome, "cpf": p.cpf} for p in pacientes])


@pacientes_bp.route("/<int:id>", methods=["GET"])
def get_paciente(id):
    paciente = Paciente.query.get(id)
    if not paciente:
        raise ValidationError("Paciente não encontrado", 404)
    return jsonify({"id": paciente.id, "nome": paciente.nome, "cpf": paciente.cpf})


# POST
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


# ROTA ESPECIAL: Encontrar paciente por reconhecimento facial
@pacientes_bp.route("/encontrar", methods=["POST"])
def encontrar_paciente():
    foto = request.files.get("foto")

    if not foto:
        raise ValidationError("Foto é obrigatória para a busca", 400)

    filename = secure_filename(f"buscar_{foto.filename}")
    foto_path = os.path.join(UPLOAD_FOLDER, filename)
    foto.save(foto_path)

    try:
        paciente_id, distancia = recognize_face(foto_path)
    except Exception as e:
        os.remove(foto_path)
        raise ValidationError(f"Erro no reconhecimento facial: {str(e)}", 400)

    os.remove(foto_path)

    if not paciente_id:
        return jsonify({"status": "not_found", "message": "Nenhum paciente correspondente encontrado"}), 404

    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"status": "error", "message": "Paciente não encontrado no banco de dados"}), 404

    return jsonify({
        "status": "success",
        "message": "Paciente encontrado",
        "paciente": {"id": paciente.id, "nome": paciente.nome, "cpf": paciente.cpf},
        "distancia": float(distancia)
    }), 200


# PUT
@pacientes_bp.route("/<int:id>", methods=["PUT"])
def atualizar_paciente(id):
    data = request.get_json()
    paciente = Paciente.query.get(id)
    if not paciente:
        raise ValidationError("Paciente não encontrado", 404)

    paciente.nome = data.get("nome", paciente.nome)
    paciente.cpf = data.get("cpf", paciente.cpf)
    db.session.commit()

    return jsonify({"status": "success", "message": "Paciente atualizado"})


# DELETE
@pacientes_bp.route("/<int:id>", methods=["DELETE"])
def deletar_paciente(id):
    paciente = Paciente.query.get(id)
    if not paciente:
        raise ValidationError("Paciente não encontrado", 404)

    db.session.delete(paciente)
    db.session.commit()

    return jsonify({"status": "success", "message": "Paciente deletado"})
