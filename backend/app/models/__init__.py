from app.database import db
from .paciente import Paciente
from .profissional import Profissional
from .atendimento import Atendimento
from .consultas import Agendamento

__all__ = ["db", "Paciente"]
