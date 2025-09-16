# app/schemas/atendimento.py
from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class AtendimentoSchema(Schema):
    idAtendimento = fields.Int(dump_only=True)
    tipoAten = fields.Str(required=True, validate=validate.Length(min=1, max=3))
    justAten = fields.Str(validate=validate.Length(max=255), allow_none=True)
    codiAten = fields.Str(required=True, validate=validate.Length(min=1, max=6))
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)
    
    @validates('tipoAten')
    def validate_tipoAten(self, value, **kwargs):
        # Adicione **kwargs para aceitar parâmetros extras
        if not value.isalpha():
            raise ValidationError('Tipo de atendimento deve conter apenas letras')
    
    @validates('codiAten')
    def validate_codiAten(self, value, **kwargs):
        # Adicione **kwargs para aceitar parâmetros extras
        if not re.match(r'^[A-Z0-9]{1,6}$', value):
            raise ValidationError('Código de atendimento deve conter apenas letras maiúsculas e números (máx. 6 caracteres)')