from marshmallow import Schema, fields, validate
from marshmallow.validate import OneOf

class AgendamentoSchema(Schema):
    idAgendamento = fields.Int(dump_only=True)
    codiAgen = fields.Int(required=True, error_messages={"required": "Código do agendamento é obrigatório"})
    
    canalAgen = fields.Str(
        required=True,
        validate=OneOf(["T", "W", "O"]),  # Telefone, WhatsApp, Online
        error_messages={
            "required": "Canal é obrigatório",
            "invalid": "Canal deve ser T (Telefone), W (WhatsApp) ou O (Online)"
        }
    )
    
    status = fields.Str(
        validate=OneOf(["PE", "CN", "CP", "CA", "RE"]),
        load_default="PE",  # Pendente por padrão
        error_messages={"invalid": "Status deve ser PE, CN, CP, CA ou RE"}
    )
    
    horario = fields.DateTime(
        required=True, 
        error_messages={"required": "Horário é obrigatório", "invalid": "Formato de data/hora inválido"}
    )
    
    idProfissional = fields.Int(
        required=True, 
        error_messages={"required": "Profissional é obrigatório"}
    )
    
    idAtendimento = fields.Int(
        required=True, 
        error_messages={"required": "Tipo de atendimento é obrigatório"}
    )
    
    idPaciente = fields.Int(  # NOVO CAMPO
        required=True, 
        error_messages={"required": "Paciente é obrigatório"}
    )
    
    criadoEm = fields.DateTime(dump_only=True)
    atualizadoEm = fields.DateTime(dump_only=True)
    
    # Nested fields para exibir dados relacionados
    profissional_nome = fields.Str(attribute="profissional.nomeComp", dump_only=True)
    paciente_nome = fields.Str(attribute="paciente.nomeComp", dump_only=True)
    atendimento_tipo = fields.Str(attribute="atendimento.tipoAten", dump_only=True)

    class Meta:
        ordered = True  # Mantém a ordem dos campos