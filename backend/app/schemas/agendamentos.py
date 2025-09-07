from marshmallow import Schema, fields, validate

class AgendamentoSchema(Schema):
    idAgendamento = fields.Int(dump_only=True)
    codiAgen = fields.Int(required=True)
    canalAgen = fields.Str(
        required=True,
        validate=validate.OneOf(["T", "W", "O"]),  # Telefone, WhatsApp, Online (exemplo)
        error_messages={"required": "Canal é obrigatório"},
    )
    status = fields.Str(
        validate=validate.OneOf(["PE", "CN", "CP", "CA", "RE"]),
        load_default="PE"   # antes era missing
    )
    horario = fields.DateTime(required=True)
    idProfissional = fields.Int(required=True)
    idAtendimento = fields.Int(required=True)
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)
