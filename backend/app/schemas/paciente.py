from marshmallow import Schema, fields, validate, ValidationError, pre_load, validates_schema
from datetime import date
import re

def valida_cpf(cpf: str) -> bool:
    if not cpf:
        return False
        
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
    idPaciente =    fields.Int(dump_only=True)
    
    nomeComp =      fields.Str(required=True, validate=validate.Length(max=50))
    cpf =           fields.Str(required=True)
    rg =            fields.Str(allow_none=True, load_default=None)
    dataNasc =      fields.Date(required=True)
    sexo =          fields.Str(required=True, validate=validate.OneOf(["M", "F", "O"]))
    
    logradouro =    fields.Str(required=True, validate=validate.Length(max=100))
    numero =        fields.Str(required=True, validate=validate.Length(max=10))
    complemento =   fields.Str(validate=validate.Length(max=50), allow_none=True, load_default=None)
    bairro =        fields.Str(required=True, validate=validate.Length(max=50))
    cidade =        fields.Str(validate=validate.Length(max=50), allow_none=True, load_default=None)
    estado =        fields.Str(required=True, validate=validate.Length(equal=2))
    cep =           fields.Str(required=True)
    
    # CAMPOS OBRIGATÓRIOS - sem load_default
    codiPais =      fields.Str(required=True, validate=validate.Length(equal=3))
    codiCidade =    fields.Str(required=True, validate=validate.Length(equal=2))
    
    telefone =      fields.Str(required=True)
    email =         fields.Email(required=True, validate=validate.Length(max=80))
    
    status =        fields.Str(required=True, validate=validate.OneOf(["A", "I"]))
    
    # CAMPOS OPCIONAIS
    responsavel =   fields.Str(validate=validate.Length(max=50), allow_none=True, load_default=None)
    tipoSangue =    fields.Str(validate=validate.Regexp(r"^(A|B|AB|O)[+-]?$"), allow_none=True, load_default=None)
    alergia =       fields.Str(validate=validate.Length(max=100), allow_none=True, load_default=None)
    histDoencas =   fields.Str(validate=validate.Length(max=255), allow_none=True, load_default=None)
    observacao =    fields.Str(validate=validate.Length(max=255), allow_none=True, load_default=None)
    
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_cpf_data(self, data, **kwargs):
        cpf = data.get("cpf")
        if cpf:
            cpf_limpo = re.sub(r"\D", "", cpf)
            if len(cpf_limpo) != 11 or not valida_cpf(cpf_limpo):
                raise ValidationError("CPF inválido", field_name="cpf")
            data["cpf"] = cpf_limpo
            
        for campo in ["rg", "cep", "telefone"]:
            if campo in data and data[campo]:
                data[campo] = re.sub(r"\D", "", data[campo])
                
        data_nasc = data.get("dataNasc")
        if data_nasc and data_nasc > date.today():
            raise ValidationError("Data de nascimento não pode ser futura", field_name="dataNasc")

    @pre_load
    def set_default_values(self, data, **kwargs):
        defaults = {
            'codiPais': 'BRA',
            'codiCidade': '01',
            'status': 'A',
            'responsavel': None,
            'alergia': None,
            'histDoencas': None,
            'observacao': None,
            'complemento': None,
            'cidade': None,
            'tipoSangue': None,
            'rg': None
        }
        
        for field, default_value in defaults.items():
            if field not in data or data[field] in ['', None]:
                data[field] = default_value
        
        # Garantir que campos required estejam presentes
        required_fields = ['nomeComp', 'cpf', 'dataNasc', 'sexo', 'logradouro', 
                          'numero', 'bairro', 'estado', 'cep', 'telefone', 'email',
                          'codiPais', 'codiCidade', 'status']
        
        for field in required_fields:
            if field not in data:
                data[field] = defaults.get(field, '')
        
        # Normalização de textos
        if 'email' in data and data['email']:
            data['email'] = data['email'].lower()
        
        text_fields_to_upper = ['nomeComp', 'sexo', 'logradouro', 'bairro']
        for field in text_fields_to_upper:
            if field in data and data[field]:
                data[field] = data[field].upper()
        
        return data