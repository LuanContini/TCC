import * as yup from "yup"

export const agendamentoSchema = yup.object({
  codiAgen: yup.number().integer().required(),
  canalAgen: yup.string().length(1),
  status: yup.string().oneOf(["PE", "CN", "CP", "CA", "RE"]), // conforme seu CHECK
  horario: yup.date().min(new Date(), "Não pode agendar para o passado").required(),
  idProfissional: yup.number().integer().required(),
  idAtendimento: yup.number().integer().required(),
})
