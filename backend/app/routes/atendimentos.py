from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.atendimento import Atendimento, db
from app.schemas.atendimento import AtendimentoSchema
from datetime import datetime
from app.utils.jwt_utils import login_required, role_required

atendimentos_bp = Blueprint('atendimentos', __name__, url_prefix='/atendimentos')

atendimento_schema = AtendimentoSchema()
atendimentos_schema = AtendimentoSchema(many=True)

# ---------- LISTAR TODOS ----------
@atendimentos_bp.route('', methods=['GET'])
@login_required
def listar_atendimentos():
    try:
        atendimentos = Atendimento.query.all()
        return jsonify({
            'success': True,
            'data': atendimentos_schema.dump(atendimentos),
            'total': len(atendimentos)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao listar atendimentos: {str(e)}'
        }), 500

# ---------- DETALHE ----------
@atendimentos_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_atendimento(id):
    try:
        atendimento = Atendimento.query.get_or_404(id)
        return jsonify({
            'success': True,
            'data': atendimento_schema.dump(atendimento)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao buscar atendimento: {str(e)}'
        }), 500

# ---------- BUSCAR POR CÓDIGO ----------
@atendimentos_bp.route('/codigo/<string:codiAten>', methods=['GET'])
@login_required
def get_atendimento_por_codigo(codiAten):
    try:
        atendimento = Atendimento.query.filter_by(codiAten=codiAten.upper()).first()
        if not atendimento:
            return jsonify({
                'success': False,
                'message': 'Atendimento não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': atendimento_schema.dump(atendimento)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao buscar atendimento: {str(e)}'
        }), 500

# ---------- CRIAR ----------
@atendimentos_bp.route('', methods=['POST'])
@login_required
@role_required("admin")
def criar_atendimento():
    try:
        dados = request.get_json()
        if not dados:
            return jsonify({
                'success': False,
                'message': 'Dados JSON são obrigatórios'
            }), 400
        
        # Converte código para maiúsculo
        if 'codiAten' in dados:
            dados['codiAten'] = dados['codiAten'].upper()
        
        dados_validados = atendimento_schema.load(dados)
        
        # Verifica se código já existe
        if Atendimento.query.filter_by(codiAten=dados_validados['codiAten']).first():
            return jsonify({
                'success': False,
                'message': 'Código de atendimento já existe'
            }), 409
        
        novo_atendimento = Atendimento(**dados_validados)
        db.session.add(novo_atendimento)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Atendimento criado com sucesso',
            'data': atendimento_schema.dump(novo_atendimento)
        }), 201
        
    except ValidationError as err:
        return jsonify({
            'success': False,
            'message': 'Dados inválidos',
            'errors': err.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao criar atendimento: {str(e)}'
        }), 500

# ---------- ATUALIZAR ----------
@atendimentos_bp.route('/<int:id>', methods=['PUT'])
@login_required
@role_required("admin")
def atualizar_atendimento(id):
    try:
        atendimento = Atendimento.query.get_or_404(id)
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'message': 'Dados JSON são obrigatórios'
            }), 400
        
        # Converte código para maiúsculo se fornecido
        if 'codiAten' in dados:
            dados['codiAten'] = dados['codiAten'].upper()
        
        dados_validados = atendimento_schema.load(dados, partial=True)
        
        # Verifica se novo código já existe (exceto para o próprio registro)
        if 'codiAten' in dados_validados:
            existing = Atendimento.query.filter(
                Atendimento.codiAten == dados_validados['codiAten'],
                Atendimento.idAtendimento != id
            ).first()
            if existing:
                return jsonify({
                    'success': False,
                    'message': 'Código de atendimento já existe'
                }), 409
        
        for campo, valor in dados_validados.items():
            setattr(atendimento, campo, valor)
        
        atendimento.atualizadoEm = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Atendimento atualizado com sucesso',
            'data': atendimento_schema.dump(atendimento)
        }), 200
        
    except ValidationError as err:
        return jsonify({
            'success': False,
            'message': 'Dados inválidos',
            'errors': err.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao atualizar atendimento: {str(e)}'
        }), 500

# ---------- DELETAR ----------
@atendimentos_bp.route('/<int:id>', methods=['DELETE'])
@login_required
@role_required("admin")
def deletar_atendimento(id):
    try:
        atendimento = Atendimento.query.get_or_404(id)
        
        # Verifica se o atendimento está sendo usado em agendamentos
        from app.models.agendamento import Agendamento
        agendamentos = Agendamento.query.filter_by(idAtendimento=id).count()
        if agendamentos > 0:
            return jsonify({
                'success': False,
                'message': 'Não é possível deletar atendimento pois está vinculado a agendamentos'
            }), 409
        
        db.session.delete(atendimento)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Atendimento {id} deletado com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao deletar atendimento: {str(e)}'
        }), 500