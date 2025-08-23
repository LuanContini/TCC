from app.database import db

from sqlalchemy.sql import func

class Paciente(db.Model):
    __tablename__ = 'paciente'

    idPaciente = db.Column(db.Integer, primary_key=True, autoincrement=True)
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
    status = db.Column(db.String(1), nullable=False)
    responsavel = db.Column(db.String(50))
    tipoSangue = db.Column(db.String(3))
    alergia = db.Column(db.String(100))
    histDoencas = db.Column(db.String(255))
    observacao = db.Column(db.String(255))
    criadoEm = db.Column(db.DateTime, server_default=func.now())
    atualizadoEm = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    idAgendamento = db.Column(db.Integer, db.ForeignKey('agendamento.idAgendamento', onupdate='RESTRICT', ondelete='CASCADE'), nullable=False)

    agendamento = db.relationship('Agendamento', backref='pacientes')

    __table_args__ = (
        db.Index('idx_paciente_status', 'status'),
        db.CheckConstraint("sexo IN ('M','F','O')", name='chk_pac_sexo'),
    )