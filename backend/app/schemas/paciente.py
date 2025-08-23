from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import date
import re

def valida_cpf(cpf: str) -> bool:
    cpf = re.sub(r"\D", "", cpf)
    if len(cpf) != 11 or cpf in [str(n)*11 for n in range(10)]:
        return False
    
    for i in range(9, 11):
        soma = sum(int(cpf[n]) * (i+1-n) for n in range(i))
        digito = 0 if (soma % 11) < 2 else 11 - (soma % 11)
        if digito != int(cpf[i]):
            return False
    return True

class PacienteSchema(Schema):
    idPaciente = fields.Int(dump_only=True)
    
    nomeComp = fields.Str(required=True, validate=validate.Length(max=50))
    cpf = fields.Str(required=True, validate=validate.Length(equal=11))
    rg = fields.Str(validate=validate.Length(equal=9), allow_none=True)
    dataNasc = fields.Date(required=True)
    sexo = fields.Str(required=True, validate=validate.OneOf(["M", "F", "O"]))
    
    logradouro = fields.Str(required=True, validate=validate.Length(max=100))
    numero = fields.Str(required=True, validate=validate.Length(max=10))
    complemento = fields.Str(validate=validate.Length(max=50), allow_none=True)
    bairro = fields.Str(required=True, validate=validate.Length(max=50))
    cidade = fields.Str(validate=validate.Length(max=50), allow_none=True)
    estado = fields.Str(required=True, validate=validate.Length(equal=2))
    cep = fields.Str(required=True, validate=validate.Length(equal=8))
    
    codiPais = fields.Str(required=True, validate=validate.Length(equal=3))
    codiCidade = fields.Str(required=True, validate=validate.Length(equal=2))
    
    telefone = fields.Str(required=True, validate=validate.Length(equal=11))
    email = fields.Email(required=True, validate=validate.Length(max=80))
    
    status = fields.Str(required=True, validate=validate.OneOf(["A", "I"]))
    responsavel = fields.Str(validate=validate.Length(max=50), allow_none=True)
    tipoSangue = fields.Str(validate=validate.Regexp(r"^(A|B|AB|O)[+-]?$"), allow_none=True)
    alergia = fields.Str(validate=validate.Length(max=100), allow_none=True)
    histDoencas = fields.Str(validate=validate.Length(max=255), allow_none=True)
    observacao = fields.Str(validate=validate.Length(max=255), allow_none=True)
    
    idAgendamento = fields.Int(required=True)
    
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)

    @validates("cpf")
    def check_cpf(self, value):
        if not valida_cpf(value):
            raise ValidationError("CPF inválido")

    @validates("dataNasc")
    def check_data_nasc(self, value):
        if value > date.today():
            raise ValidationError("Data de nascimento não pode ser futura")

    @validates("email")
    def normalize_email(self, value):
        return value.lower()

    @validates("nomeComp")
    def normalize_nome(self, value):
        return value.upper()

    @validates("sexo")
    def normalize_sexo(self, value):
        return value.upper()

    @validates("logradouro")
    def normalize_logradouro(self, value):
        return value.upper()

    @validates("bairro")
    def normalize_bairro(self, value):
        return value.upper()

    @validates("responsavel")
    def normalize_responsavel(self, value):
        if value:
            return value.upper()
