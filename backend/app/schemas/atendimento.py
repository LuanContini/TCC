from marshmallow import Schema, fields, validate

class AtendimentoSchema(Schema):
    idAtendimento = fields.Int(dump_only=True)
    tipoAten = fields.Str(required=True, validate=validate.Length(max=3))
    justAten = fields.Str(validate=validate.Length(max=255))
    codiAten = fields.Str(required=True, validate=validate.Length(max=6))
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)
