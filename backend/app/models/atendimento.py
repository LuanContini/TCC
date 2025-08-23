from app.database import db
from sqlalchemy.sql import func

class Atendimento(db.Model):
	__tablename__ = 'atendimento'

	idAtendimento = db.Column(db.Integer, primary_key=True, autoincrement=True)
	tipoAten = db.Column(db.String(3), nullable=False)
	justAten = db.Column(db.String(255))
	codiAten = db.Column(db.String(6), nullable=False, unique=True)
	criadoEm = db.Column(db.DateTime, server_default=func.now())
	atualizadoEm = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())