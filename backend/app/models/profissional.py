from app.database import db
from sqlalchemy.sql import func

class Profissional(db.Model):
	__tablename__ = 'profissional'

	idProfissional = db.Column(db.Integer, primary_key=True, autoincrement=True)
	nomeComp = db.Column(db.String(50), nullable=False)
	cpf = db.Column(db.String(11), nullable=False, unique=True)
	rg = db.Column(db.String(9), unique=True)
	dataNasc = db.Column(db.Date, nullable=False)
	sexo = db.Column(db.String(1), nullable=False)
	logradouro = db.Column(db.String(100), nullable=False)
	numero = db.Column(db.String(10), nullable=False)
	complemento = db.Column(db.String(50))
	bairro = db.Column(db.String(50), nullable=False)
	cidade = db.Column(db.String(50))
	estado = db.Column(db.String(2), nullable=False)
	cep = db.Column(db.String(8), nullable=False)
	codiPais = db.Column(db.String(3), nullable=False)
	codiCidade = db.Column(db.String(2), nullable=False)
	telefone = db.Column(db.String(11), nullable=False)
	email = db.Column(db.String(80), nullable=False)
	tipoConc = db.Column(db.String(5), nullable=False)
	codiConc = db.Column(db.String(15), nullable=False)
	codiConc_UF = db.Column(db.String(2), nullable=False)
	status = db.Column(db.String(1), nullable=False)
	disponibilidade = db.Column(db.Integer)
	criadoEm = db.Column(db.DateTime, server_default=func.now())
	atualizadoEm = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())

	__table_args__ = (
		db.UniqueConstraint('tipoConc', 'codiConc', 'codiConc_UF', name='uk_profissional_conselho'),
		db.Index('idx_profissional_status', 'status'),
		db.CheckConstraint("sexo IN ('M','F','O')", name='chk_prof_sexo'),
	)
