import * as yup from "yup"

export const agendamentoSchema = yup.object().shape({
  codiAgen: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .required("Código é obrigatório"),
  canalAgen: yup
    .string()
    .oneOf(["T","W","O"], "Canal inválido")
    .required("Canal é obrigatório"),
  status: yup
    .string()
    .oneOf(["PE","CN","CP","CA","RE"], "Status inválido")
    .required("Status é obrigatório"),
  horario: yup
    .date()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .required("Horário é obrigatório"),
  idProfissional: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .required("Profissional é obrigatório"),
  idPaciente: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .required("Paciente é obrigatório"),
  idAtendimento: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .required("Atendimento é obrigatório"),
})
