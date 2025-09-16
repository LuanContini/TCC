from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.paciente import Paciente, db
from app.schemas.paciente import PacienteSchema
from app.utils.facial_recognition import register_face, recognize_face
from app.utils.jwt_utils import login_required, role_required
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import uuid  # Para gerar nomes únicos de arquivo

pacientes_bp = Blueprint("pacientes", __name__, url_prefix="/pacientes")

paciente_schema = PacienteSchema()
pacientes_schema = PacienteSchema(many=True)

UPLOAD_FOLDER = "uploads/faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ---------- LISTAR TODOS ----------
@pacientes_bp.route("", methods=["GET"])
@login_required
def listar_pacientes():
    try:
        pacientes = Paciente.query.all()
        return jsonify(pacientes_schema.dump(pacientes)), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao listar pacientes: {str(e)}"}), 500


# ---------- DETALHE POR ID ----------
@pacientes_bp.route("/<int:id>", methods=["GET"])
@login_required
def get_paciente(id):
    try:
        paciente = Paciente.query.get(id)
        if not paciente:
            return jsonify({"erro": "Paciente não encontrado"}), 404
        return jsonify(paciente_schema.dump(paciente)), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar paciente: {str(e)}"}), 500


# ---------- CRIAR (com reconhecimento facial, apenas admin) ----------
@pacientes_bp.route("", methods=["POST"])
@login_required
@role_required("admin")
def criar_paciente():
    try:
        print("Dados do formulário:", dict(request.form))
        print("Arquivos recebidos:", dict(request.files))

        dados = dict(request.form)
        print("Dados recebidos:", dados)

        paciente_data = dados
        print("Dados que serão usados:", paciente_data)

    except Exception as e:
        print("Erro geral:", str(e))
        return jsonify({"erro": f"Erro ao processar requisição: {str(e)}"}), 500

    foto = request.files.get("foto")
    if not foto:
        return jsonify({"erro": "Foto é obrigatória"}), 400

    if not foto.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        return (
            jsonify({"erro": "Formato de arquivo não suportado. Use PNG, JPG ou JPEG"}),
            400,
        )

    try:
        print("Criando objeto Paciente com dados:", paciente_data)
        novo = Paciente(**paciente_data)
        print("Objeto Paciente criado:", novo)

        db.session.add(novo)
        print("Paciente adicionado à sessão")

        db.session.flush()  
        print("Flush realizado, ID do paciente:", novo.idPaciente)

        unique_id = uuid.uuid4().hex
        filename = secure_filename(f"{novo.idPaciente}_{unique_id}_{foto.filename}")
        foto_path = os.path.join(UPLOAD_FOLDER, filename)

        foto.save(foto_path)
        print("Foto salva em:", foto_path)

        try:
            print("Registrando rosto...")
            register_face(foto_path, novo.idPaciente)
            print("Rosto registrado com sucesso")

            db.session.commit()
            print("Commit realizado com sucesso!")

            return jsonify(paciente_schema.dump(novo)), 201

        except Exception as e:
            print("Erro no reconhecimento facial:", str(e))
            db.session.rollback()
            if os.path.exists(foto_path):
                os.remove(foto_path)
            return (
                jsonify({"erro": f"Erro ao processar reconhecimento facial: {str(e)}"}),
                400,
            )

    except Exception as e:
        print("Erro ao criar paciente:", str(e))
        db.session.rollback()
        return jsonify({"erro": f"Erro ao criar paciente: {str(e)}"}), 500



# ---------- ENCONTRAR PACIENTE POR ROSTO ----------
@pacientes_bp.route("/encontrar", methods=["POST"])
@login_required
@role_required("admin", "atendente")  
def encontrar_paciente():
    foto = request.files.get("foto")
    if not foto:
        return jsonify({"erro": "Foto é obrigatória"}), 400

    if not foto.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        return (
            jsonify({"erro": "Formato de arquivo não suportado. Use PNG, JPG ou JPEG"}),
            400,
        )

    unique_id = uuid.uuid4().hex
    filename = secure_filename(f"buscar_{unique_id}_{foto.filename}")
    foto_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        foto.save(foto_path)

        paciente_id, distancia = recognize_face(foto_path)

        if os.path.exists(foto_path):
            os.remove(foto_path)

        if not paciente_id:
            return (
                jsonify(
                    {
                        "status": "not_found",
                        "mensagem": "Nenhum paciente correspondente encontrado",
                    }
                ),
                404,
            )

        paciente = Paciente.query.get(paciente_id)
        if not paciente:
            return (
                jsonify(
                    {
                        "status": "error",
                        "mensagem": "Paciente não encontrado no banco de dados",
                    }
                ),
                404,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "paciente": paciente_schema.dump(paciente),
                    "distancia": float(distancia) if distancia else 0.0,
                    "confianca": (
                        f"{(1 - (float(distancia) if distancia else 0.0)) * 100:.2f}%"
                        if distancia
                        else "N/A"
                    ),
                }
            ),
            200,
        )

    except Exception as e:
        if os.path.exists(foto_path):
            os.remove(foto_path)
        return jsonify({"erro": f"Erro no reconhecimento facial: {str(e)}"}), 400


# ---------- ATUALIZAR ----------
@pacientes_bp.route("/<int:id>", methods=["PUT"])
@login_required
@role_required("admin")
def atualizar_paciente(id):
    try:
        paciente = Paciente.query.get(id)
        if not paciente:
            return jsonify({"erro": "Paciente não encontrado"}), 404

        dados = dict(request.form)
        print("Dados recebidos para edição:", dados)

        paciente_data = paciente_schema.load(dados, partial=True)

        for campo, valor in paciente_data.items():
            if hasattr(paciente, campo) and valor is not None:
                setattr(paciente, campo, valor)

        foto = request.files.get("foto")
        if foto:
            if not foto.filename.lower().endswith((".png", ".jpg", ".jpeg")):
                return (
                    jsonify(
                        {
                            "erro": "Formato de arquivo não suportado. Use PNG, JPG ou JPEG"
                        }
                    ),
                    400,
                )

            # Gerar nome único para a nova foto
            unique_id = uuid.uuid4().hex
            filename = secure_filename(
                f"{paciente.idPaciente}_{unique_id}_{foto.filename}"
            )
            foto_path = os.path.join(UPLOAD_FOLDER, filename)

            # Salvar nova foto
            foto.save(foto_path)

            try:
                # Atualizar reconhecimento facial
                register_face(foto_path, paciente.idPaciente)
            except Exception as e:
                # Remover arquivo se houver erro no reconhecimento
                if os.path.exists(foto_path):
                    os.remove(foto_path)
                return jsonify({"erro": f"Erro ao processar nova foto: {str(e)}"}), 400

        paciente.atualizadoEm = datetime.utcnow()
        db.session.commit()

        return jsonify(paciente_schema.dump(paciente)), 200

    except ValidationError as err:
        print("🚨 ERROS DE VALIDAÇÃO NA ATUALIZAÇÃO:", err.messages)
        return jsonify(err.messages), 400
    except Exception as e:
        db.session.rollback()
        print("Erro ao atualizar paciente:", str(e))
        return jsonify({"erro": f"Erro ao atualizar paciente: {str(e)}"}), 500


# ---------- DELETAR ----------
@pacientes_bp.route("/<int:id>", methods=["DELETE"])
@login_required
@role_required("admin")
def deletar_paciente(id):
    try:
        paciente = Paciente.query.get(id)
        if not paciente:
            return jsonify({"erro": "Paciente não encontrado"}), 404

        # TODO: Adicionar lógica para remover arquivos de face associados
        # Isso depende de como você está gerenciando os arquivos de reconhecimento facial

        db.session.delete(paciente)
        db.session.commit()

        return (
            jsonify({"mensagem": f"Paciente {id} deletado com sucesso", "id": id}),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao deletar paciente: {str(e)}"}), 500
