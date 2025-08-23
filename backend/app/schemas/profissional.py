from marshmallow import Schema, fields, validate, ValidationError, pre_load, validates_schema
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

class ProfissionalSchema(Schema):
    idProfissional = fields.Int(dump_only=True)
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
    tipoConc = fields.Str(required=True, validate=validate.Length(max=5))
    codiConc = fields.Str(required=True, validate=validate.Length(max=15))
    codiConc_UF = fields.Str(required=True, validate=validate.Length(equal=2))
    status = fields.Str(required=True, validate=validate.OneOf(["A", "I"]))
    disponibilidade = fields.Int(validate=validate.Range(min=0), allow_none=True)
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)

    # Validação de CPF e data de nascimento
    @validates_schema
    def validate_cpf_data(self, data, **kwargs):
        cpf = data.get("cpf")
        if cpf and not valida_cpf(cpf):
            raise ValidationError("CPF inválido", field_name="cpf")
        data_nasc = data.get("dataNasc")
        if data_nasc and data_nasc > date.today():
            raise ValidationError("Data de nascimento não pode ser futura", field_name="dataNasc")

    # Normalização antes do load
    @pre_load
    def normalize_data(self, data, **kwargs):
        if "email" in data and data["email"]:
            data["email"] = data["email"].lower()
        if "nomeComp" in data and data["nomeComp"]:
            data["nomeComp"] = data["nomeComp"].upper()
        if "sexo" in data and data["sexo"]:
            data["sexo"] = data["sexo"].upper()
        if "logradouro" in data and data["logradouro"]:
            data["logradouro"] = data["logradouro"].upper()
        if "bairro" in data and data["bairro"]:
            data["bairro"] = data["bairro"].upper()
        return data
