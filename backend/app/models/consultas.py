from app.database import db
from sqlalchemy.sql import func

class Agendamento(db.Model):
	__tablename__ = 'agendamento'

	idAgendamento = db.Column(db.Integer, primary_key=True, autoincrement=True)
	codiAgen = db.Column(db.Integer, nullable=False, unique=True)
	canalAgen = db.Column(db.String(1))
	status = db.Column(db.String(2))
	horario = db.Column(db.DateTime, nullable=False)
	criadoEm = db.Column(db.DateTime, server_default=func.now())
	atualizadoEm = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
	idProfissional = db.Column(db.Integer, db.ForeignKey('profissional.idProfissional', onupdate='RESTRICT', ondelete='CASCADE'), nullable=False)
	idAtendimento = db.Column(db.Integer, db.ForeignKey('atendimento.idAtendimento', onupdate='RESTRICT', ondelete='CASCADE'), nullable=False)

	profissional = db.relationship('Profissional', backref='agendamentos')
	atendimento = db.relationship('Atendimento', backref='agendamentos')

	__table_args__ = (
		db.Index('idx_agendamento_horario', 'horario'),
		db.Index('idx_agendamento_status', 'status'),
		db.CheckConstraint("status IN ('PE','CN','CP','CA','RE')", name='chk_ag_status'),
	)