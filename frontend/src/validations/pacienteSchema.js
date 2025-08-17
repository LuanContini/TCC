import * as yup from "yup";

export const pacienteSchema = yup.object({
  nomeComp: yup
    .string()
    .max(50, "O nome não pode ter mais de 50 caracteres")
    .required("O nome é obrigatório"),

  cpf: yup
    .string()
    .matches(/^\d{11}$/, "O CPF deve ter exatamente 11 números")
    .required("O CPF é obrigatório"),

  rg: yup
    .string()
    .matches(/^\d{9}$/, "O RG deve ter exatamente 9 números")
    .nullable(),

  dataNasc: yup
    .date()
    .typeError("Data de nascimento inválida") // mensagem personalizada
    .nullable()
    .required("Data de nascimento é obrigatória"),

  sexo: yup
    .string()
    .oneOf(["M", "F", "O"], "Sexo inválido")
    .required("O sexo é obrigatório"),

  logradouro: yup
    .string()
    .max(100, "O logradouro não pode ter mais de 100 caracteres")
    .required("O logradouro é obrigatório"),

  numero: yup
    .string()
    .max(10, "O número não pode ter mais de 10 caracteres")
    .required("O número é obrigatório"),

  complemento: yup
    .string()
    .max(50, "O complemento não pode ter mais de 50 caracteres")
    .nullable(),

  bairro: yup
    .string()
    .max(50, "O bairro não pode ter mais de 50 caracteres")
    .required("O bairro é obrigatório"),

  cidade: yup
    .string()
    .max(50, "A cidade não pode ter mais de 50 caracteres")
    .nullable(),

  estado: yup
    .string()
    .length(2, "O estado deve ter 2 caracteres")
    .required("O estado é obrigatório"),

  cep: yup
    .string()
    .matches(/^\d{8}$/, "O CEP deve ter exatamente 8 números")
    .required("O CEP é obrigatório"),

  telefone: yup
    .string()
    .matches(/^\d{11}$/, "O telefone deve ter exatamente 11 números")
    .required("O telefone é obrigatório"),

  email: yup
    .string()
    .email("E-mail inválido")
    .max(80, "O e-mail não pode ter mais de 80 caracteres")
    .required("O e-mail é obrigatório"),

  status: yup
    .string()
    .oneOf(["A", "I"], "Status inválido")
    .required("O status é obrigatório"),

  responsavel: yup
    .string()
    .max(50, "O responsável não pode ter mais de 50 caracteres")
    .nullable(),

  tipoSangue: yup
    .string()
    .matches(/^(A|B|AB|O)[+-]?$/, "Tipo sanguíneo inválido")
    .nullable(),

  alergia: yup
    .string()
    .max(100, "A alergia não pode ter mais de 100 caracteres")
    .nullable(),

  histDoencas: yup
    .string()
    .max(255, "Histórico de doenças muito longo")
    .nullable(),

  observacao: yup.string().max(255, "Observação muito longa").nullable(),

  idAgendamento: yup
    .number()
    .integer("ID de agendamento inválido")
    .required("O agendamento é obrigatório"),
});
