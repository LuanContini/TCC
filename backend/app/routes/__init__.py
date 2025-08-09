from flask import Blueprint

from .pacientes import pacientes_bp
from .profissionais import profissionais_bp
from .consultas import consultas_bp
from .atendimentos import atendimentos_bp

def register_routes(app):
    app.register_blueprint(pacientes_bp, url_prefix="/pacientes")
    app.register_blueprint(profissionais_bp, url_prefix="/profissionais")
    app.register_blueprint(consultas_bp, url_prefix="/consultas")
    app.register_blueprint(atendimentos_bp, url_prefix="/atendimentos")
