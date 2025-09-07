from marshmallow import Schema, fields, validate, ValidationError


# Schema para registro de usuário
class RegistroSchema(Schema):
    nome = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=120))
    senha = fields.Str(required=True, validate=validate.Length(min=6))
    role = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["admin", "profissional", "atendente"], error="Role inválido"
        ),
    )


# Schema para login de usuário
class LoginSchema(Schema):
    email = fields.Email(required=True)
    senha = fields.Str(required=True, validate=validate.Length(min=6))
