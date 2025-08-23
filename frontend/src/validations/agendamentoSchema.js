import * as yup from "yup";

export const agendamentoSchema = yup.object({
  date: yup
    .date()
    .typeError("Data inválida")
    .required("Data é obrigatória"),
  
  time: yup
    .string()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Hora inválida")
    .required("Hora é obrigatória"),
  
  patientId: yup
    .number()
    .typeError("ID do paciente deve ser um número")
    .required("Paciente é obrigatório"),

  professionalId: yup
    .number()
    .typeError("ID do profissional deve ser um número")
    .required("Profissional é obrigatório"),

  type: yup
    .string()
    .oneOf(["consulta","retorno","exame"], "Tipo inválido")
    .required("Tipo é obrigatório"),

  status: yup
    .string()
    .oneOf(["marcado","confirmado","cancelado","realizado"], "Status inválido")
    .required("Status é obrigatório"),

  reason: yup
    .string()
    .max(255, "Motivo deve ter no máximo 255 caracteres")
    .nullable(),

  channel: yup
    .string()
    .oneOf(["telefone","whatsapp","online"], "Canal inválido")
    .required("Canal é obrigatório"),

  duration: yup
    .number()
    .integer("Duração deve ser um número inteiro")
    .min(1, "Duração mínima 1 minuto")
    .required("Duração é obrigatória")
});
