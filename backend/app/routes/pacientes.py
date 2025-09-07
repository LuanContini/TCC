from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.paciente import Paciente, db
from app.schemas.paciente import PacienteSchema
from app.utils.facial_recognition import register_face, recognize_face
from app.utils.jwt_utils import login_required, role_required
from werkzeug.utils import secure_filename
import os
from datetime import datetime

pacientes_bp = Blueprint("pacientes", __name__, url_prefix="/pacientes")

paciente_schema = PacienteSchema()
pacientes_schema = PacienteSchema(many=True)

UPLOAD_FOLDER = "uploads/faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ---------- LISTAR TODOS ----------
@pacientes_bp.route("", methods=["GET"])
@login_required
def listar_pacientes():
    pacientes = Paciente.query.all()
    return jsonify(pacientes_schema.dump(pacientes)), 200


# ---------- DETALHE POR ID ----------
@pacientes_bp.route("/<int:id>", methods=["GET"])
@login_required
def get_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    return jsonify(paciente_schema.dump(paciente)), 200


# ---------- CRIAR (com reconhecimento facial, apenas admin) ----------
@pacientes_bp.route("", methods=["POST"])
@login_required
@role_required("admin")
def criar_paciente():
    dados = dict(request.form)

    try:
        paciente_data = paciente_schema.load(dados)
    except ValidationError as err:
        return jsonify(err.messages), 400

    foto = request.files.get("foto")
    if not foto:
        return jsonify({"erro": "Foto é obrigatória"}), 400

    novo = Paciente(**paciente_data)
    db.session.add(novo)
    db.session.commit()

    # Salvar foto no disco
    filename = secure_filename(f"{novo.idPaciente}_{foto.filename}")
    foto_path = os.path.join(UPLOAD_FOLDER, filename)
    foto.save(foto_path)

    try:
        register_face(foto_path, novo.idPaciente)
    except Exception as e:
        db.session.delete(novo)
        db.session.commit()
        os.remove(foto_path)
        return jsonify({"erro": f"Erro ao processar foto: {str(e)}"}), 400

    return jsonify(paciente_schema.dump(novo)), 201


# ---------- ENCONTRAR PACIENTE POR ROSTO ----------
@pacientes_bp.route("/encontrar", methods=["POST"])
@login_required
def encontrar_paciente():
    foto = request.files.get("foto")
    if not foto:
        return jsonify({"erro": "Foto é obrigatória"}), 400

    filename = secure_filename(f"buscar_{foto.filename}")
    foto_path = os.path.join(UPLOAD_FOLDER, filename)
    foto.save(foto_path)

    try:
        paciente_id, distancia = recognize_face(foto_path)
    except Exception as e:
        os.remove(foto_path)
        return jsonify({"erro": f"Erro no reconhecimento: {str(e)}"}), 400

    os.remove(foto_path)

    if not paciente_id:
        return jsonify({"status": "not_found", "mensagem": "Nenhum paciente encontrado"}), 404

    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"status": "error", "mensagem": "Paciente não encontrado no banco"}), 404

    return jsonify({
        "status": "success",
        "paciente": paciente_schema.dump(paciente),
        "distancia": distancia
    }), 200


# ---------- ATUALIZAR ----------
@pacientes_bp.route("/<int:id>", methods=["PUT"])
@login_required
@role_required("admin")
def atualizar_paciente(id):
    paciente = Paciente.query.get_or_404(id)

    try:
        dados = paciente_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for campo, valor in dados.items():
        setattr(paciente, campo, valor)

    paciente.atualizadoEm = datetime.utcnow()
    db.session.commit()

    return jsonify(paciente_schema.dump(paciente)), 200


# ---------- DELETAR ----------
@pacientes_bp.route("/<int:id>", methods=["DELETE"])
@login_required
@role_required("admin")
def deletar_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    db.session.delete(paciente)
    db.session.commit()
    return jsonify({"mensagem": f"Paciente {id} deletado com sucesso"}), 200
