from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class UsuarioSchema(Schema):
    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=120))
    senha = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    role = fields.Str(required=True, validate=validate.OneOf(["admin", "atendente", "medico"]))
    
    @validates('senha')
    def validate_senha(self, value, **kwargs):
        if len(value) < 6:
            raise ValidationError("A senha deve ter pelo menos 6 caracteres")
        if not re.search(r'[A-Z]', value):
            raise ValidationError("A senha deve conter pelo menos uma letra maiúscula")
        if not re.search(r'[a-z]', value):
            raise ValidationError("A senha deve conter pelo menos uma letra minúscula")
        if not re.search(r'[0-9]', value):
            raise ValidationError("A senha deve conter pelo menos um número")
    
    @validates('email')
    def validate_email(self, value, **kwargs):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise ValidationError("Formato de email inválido")

class LoginSchema(Schema):
    email = fields.Email(required=True, validate=validate.Length(max=120))
    senha = fields.Str(required=True, validate=validate.Length(min=1))
    
    @validates('email')
    def validate_email(self, value, **kwargs):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise ValidationError("Formato de email inválido")