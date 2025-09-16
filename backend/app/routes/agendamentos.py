from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.agendamento import Agendamento, db
from app.schemas.agendamentos import AgendamentoSchema
from app.utils.jwt_utils import login_required, role_required

agendamentos_bp = Blueprint("agendamentos", __name__, url_prefix="/agendamentos")

agendamento_schema = AgendamentoSchema()
agendamentos_schema = AgendamentoSchema(many=True)

# ---------- LISTAR AGENDAMENTOS ----------
@agendamentos_bp.route("", methods=["GET"])
@login_required
def listar_agendamentos():
    try:
        # Filtros opcionais
        profissional_id = request.args.get('profissional')
        paciente_id = request.args.get('paciente')
        data = request.args.get('data')
        status = request.args.get('status')
        expand = request.args.get('expand')
        
        query = Agendamento.query
        
        # Aplicar joins se expand for solicitado
        if expand and 'paciente' in expand:
            query = query.join(Agendamento.paciente)
        if expand and 'profissional' in expand:
            query = query.join(Agendamento.profissional)
        if expand and 'atendimento' in expand:
            query = query.join(Agendamento.atendimento)
        
        # Aplicar filtros
        if profissional_id:
            query = query.filter_by(idProfissional=profissional_id)
        if paciente_id:
            query = query.filter_by(idPaciente=paciente_id)
        if data:
            query = query.filter(db.func.date(Agendamento.horario) == data)
        if status:
            query = query.filter_by(status=status)
            
        agendamentos = query.order_by(Agendamento.horario.asc()).all()
        
        # Serializar os dados
        result = agendamentos_schema.dump(agendamentos)
        
        # Adicionar dados expandidos se solicitado
        if expand:
            for i, agendamento in enumerate(agendamentos):
                if 'paciente' in expand and agendamento.paciente:
                    result[i]['paciente_nome'] = agendamento.paciente.nomeComp
                if 'profissional' in expand and agendamento.profissional:
                    result[i]['profissional_nome'] = agendamento.profissional.nomeComp
                if 'atendimento' in expand and agendamento.atendimento:
                    result[i]['atendimento_tipo'] = agendamento.atendimento.tipoAten
                    result[i]['atendimento_descricao'] = agendamento.atendimento.justAten
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"erro": f"Erro ao listar agendamentos: {str(e)}"}), 500

# ---------- OBTER AGENDAMENTO POR ID ----------
@agendamentos_bp.route("/<int:id>", methods=["GET"])
@login_required
def obter_agendamento(id):
    try:
        expand = request.args.get('expand')
        
        query = Agendamento.query.filter_by(idAgendamento=id)
        
        # Aplicar joins se expand for solicitado
        if expand and 'paciente' in expand:
            query = query.join(Agendamento.paciente)
        if expand and 'profissional' in expand:
            query = query.join(Agendamento.profissional)
        if expand and 'atendimento' in expand:
            query = query.join(Agendamento.atendimento)
        
        agendamento = query.first()
        
        if not agendamento:
            return jsonify({"erro": "Agendamento não encontrado"}), 404
        
        # Serializar os dados
        result = agendamento_schema.dump(agendamento)
        
        # Adicionar dados expandidos se solicitado
        if expand:
            if 'paciente' in expand and agendamento.paciente:
                result['paciente_nome'] = agendamento.paciente.nomeComp
                result['paciente_telefone'] = agendamento.paciente.telefone
            if 'profissional' in expand and agendamento.profissional:
                result['profissional_nome'] = agendamento.profissional.nomeComp
            if 'atendimento' in expand and agendamento.atendimento:
                result['atendimento_tipo'] = agendamento.atendimento.tipoAten
                result['atendimento_descricao'] = agendamento.atendimento.justAten
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"erro": f"Erro ao obter agendamento: {str(e)}"}), 500

# ---------- CRIAR AGENDAMENTO ----------
@agendamentos_bp.route("", methods=["POST"])
@login_required
@role_required("admin", "atendente")
def criar_agendamento():
    try:
        dados = request.get_json()
        
        # Validar dados
        agendamento_data = agendamento_schema.load(dados)
        
        # Verificar conflito de horário
        horario_existente = Agendamento.query.filter(
            Agendamento.idProfissional == agendamento_data['idProfissional'],
            Agendamento.horario == agendamento_data['horario'],
            Agendamento.status.in_(['PE', 'CP'])  # Pendente ou Confirmado
        ).first()
        
        if horario_existente:
            return jsonify({"erro": "Conflito de horário para este profissional"}), 400
        
        # Criar agendamento
        novo_agendamento = Agendamento(**agendamento_data)
        db.session.add(novo_agendamento)
        db.session.commit()
        
        return jsonify(agendamento_schema.dump(novo_agendamento)), 201
        
    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao criar agendamento: {str(e)}"}), 500

# ---------- ATUALIZAR AGENDAMENTO ----------
@agendamentos_bp.route("/<int:id>", methods=["PUT"])
@login_required
@role_required("admin", "atendente")
def atualizar_agendamento(id):
    try:
        agendamento = Agendamento.query.get(id)
        if not agendamento:
            return jsonify({"erro": "Agendamento não encontrado"}), 404
        
        dados = request.get_json()
        agendamento_data = agendamento_schema.load(dados, partial=True)
        
        # Verificar conflito de horário (apenas se o horário estiver sendo alterado)
        if 'horario' in agendamento_data and agendamento_data['horario'] != agendamento.horario:
            horario_existente = Agendamento.query.filter(
                Agendamento.idProfissional == agendamento.idProfissional,
                Agendamento.horario == agendamento_data['horario'],
                Agendamento.status.in_(['PE', 'CP']),
                Agendamento.idAgendamento != id
            ).first()
            
            if horario_existente:
                return jsonify({"erro": "Conflito de horário para este profissional"}), 400
        
        # Atualizar campos
        for campo, valor in agendamento_data.items():
            if hasattr(agendamento, campo):
                setattr(agendamento, campo, valor)
        
        db.session.commit()
        return jsonify(agendamento_schema.dump(agendamento)), 200
        
    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao atualizar agendamento: {str(e)}"}), 500

# ---------- CANCELAR AGENDAMENTO ----------
@agendamentos_bp.route("/<int:id>/cancelar", methods=["PUT"])
@login_required
@role_required("admin", "atendente")
def cancelar_agendamento(id):
    try:
        agendamento = Agendamento.query.get(id)
        if not agendamento:
            return jsonify({"erro": "Agendamento não encontrado"}), 404
        
        agendamento.status = "CA"  # Cancelado (corrigido)
        db.session.commit()
        
        return jsonify({
            "mensagem": "Agendamento cancelado com sucesso",
            "agendamento": agendamento_schema.dump(agendamento)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao cancelar agendamento: {str(e)}"}), 500

# ---------- CONFIRMAR AGENDAMENTO ----------
@agendamentos_bp.route("/<int:id>/confirmar", methods=["PUT"])
@login_required
@role_required("admin", "atendente")
def confirmar_agendamento(id):
    try:
        agendamento = Agendamento.query.get(id)
        if not agendamento:
            return jsonify({"erro": "Agendamento não encontrado"}), 404
        
        agendamento.status = "CN"  # Confirmado
        db.session.commit()
        
        return jsonify({
            "mensagem": "Agendamento confirmado com sucesso",
            "agendamento": agendamento_schema.dump(agendamento)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao confirmar agendamento: {str(e)}"}), 500

# ---------- REAGENDAR AGENDAMENTO ----------
@agendamentos_bp.route("/<int:id>/reagendar", methods=["PUT"])
@login_required
@role_required("admin", "atendente")
def reagendar_agendamento(id):
    try:
        agendamento = Agendamento.query.get(id)
        if not agendamento:
            return jsonify({"erro": "Agendamento não encontrado"}), 404
        
        dados = request.get_json()
        novo_horario = dados.get('horario')
        
        if not novo_horario:
            return jsonify({"erro": "Novo horário é obrigatório"}), 400
        
        # Verificar conflito de horário
        horario_existente = Agendamento.query.filter(
            Agendamento.idProfissional == agendamento.idProfissional,
            Agendamento.horario == novo_horario,
            Agendamento.status.in_(['PE', 'CN']),
            Agendamento.idAgendamento != id
        ).first()
        
        if horario_existente:
            return jsonify({"erro": "Conflito de horário para este profissional"}), 400
        
        # Atualizar horário e status
        agendamento.horario = novo_horario
        agendamento.status = "RE"  # Reagendado
        
        db.session.commit()
        
        return jsonify({
            "mensagem": "Agendamento reagendado com sucesso",
            "agendamento": agendamento_schema.dump(agendamento)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro ao reagendar agendamento: {str(e)}"}), 500