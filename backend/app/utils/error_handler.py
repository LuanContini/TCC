from flask import jsonify
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
import pymysql

def register_error_handlers(app):
    
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        # Extrair informações do erro do MySQL
        error_msg = str(error.orig)
        
        if "Duplicate entry" in error_msg:
            # Extrair o campo que causou a duplicação
            if "for key 'cpf'" in error_msg:
                return jsonify({
                    "error": "Erro de duplicidade",
                    "message": "CPF já cadastrado no sistema",
                    "field": "cpf"
                }), 409
            elif "for key 'email'" in error_msg:
                return jsonify({
                    "error": "Erro de duplicidade", 
                    "message": "Email já cadastrado no sistema",
                    "field": "email"
                }), 409
            elif "for key 'codiConc'" in error_msg:
                return jsonify({
                    "error": "Erro de duplicidade",
                    "message": "Código do conselho já cadastrado",
                    "field": "codiConc"
                }), 409
            elif "for key 'rg'" in error_msg:
                return jsonify({
                    "error": "Erro de duplicidade",
                    "message": "RG já cadastrado no sistema", 
                    "field": "rg"
                }), 409
        
        return jsonify({
            "error": "Erro de integridade do banco de dados",
            "message": "Dados inconsistentes ou duplicados"
        }), 400

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({
            "error": "Erro de validação",
            "message": "Dados inválidos fornecidos",
            "details": error.messages
        }), 400

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            "error": "Recurso não encontrado",
            "message": "O item solicitado não existe"
        }), 404

    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            "error": "Erro interno do servidor",
            "message": "Ocorreu um erro inesperado"
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        return jsonify({
            "error": "Erro inesperado",
            "message": str(error)
        }), 500