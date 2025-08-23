// profissionalSchema.js
import * as yup from "yup"

export const profissionalSchema = yup.object({
  nomeComp: yup
    .string()
    .max(50, "Nome completo deve ter no máximo 50 caracteres")
    .required("Nome completo é obrigatório"),

  cpf: yup
    .string()
    .matches(/^\d{11}$/, "CPF deve ter 11 números")
    .required("CPF é obrigatório"),

  rg: yup
    .string()
    .matches(/^\d{9}$/, "RG deve ter 9 números")
    .nullable(),

  dataNasc: yup
    .date()
    .typeError("Data de nascimento inválida")
    .nullable()
    .required("Data de nascimento é obrigatória"),

  sexo: yup
    .string()
    .oneOf(["M", "F", "O"], "Sexo deve ser M, F ou O")
    .required("Sexo é obrigatório"),

  logradouro: yup
    .string()
    .max(100, "Logradouro deve ter no máximo 100 caracteres")
    .required("Logradouro é obrigatório"),

  numero: yup
    .string()
    .max(10, "Número deve ter no máximo 10 caracteres")
    .required("Número é obrigatório"),

  complemento: yup.string().max(50).nullable(),

  bairro: yup
    .string()
    .max(50, "Bairro deve ter no máximo 50 caracteres")
    .required("Bairro é obrigatório"),

  cidade: yup.string().max(50, "Cidade deve ter no máximo 50 caracteres"),

  estado: yup
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .required("Estado é obrigatório"),

  cep: yup
    .string()
    .matches(/^\d{8}$/, "CEP deve ter 8 números")
    .required("CEP é obrigatório"),

  codiPais: yup
    .string()
    .length(3, "Código do país deve ter 3 caracteres")
    .required("Código do país é obrigatório"),

  codiCidade: yup
    .string()
    .length(2, "Código da cidade deve ter 2 caracteres")
    .required("Código da cidade é obrigatório"),

  telefone: yup
    .string()
    .matches(/^\d{11}$/, "Telefone deve ter 11 números")
    .required("Telefone é obrigatório"),

  email: yup
    .string()
    .email("Email inválido")
    .max(80, "Email deve ter no máximo 80 caracteres")
    .required("Email é obrigatório"),

  tipoConc: yup
    .string()
    .max(5, "Tipo de conselho deve ter no máximo 5 caracteres")
    .required("Tipo de conselho é obrigatório"),

  codiConc: yup
    .string()
    .max(15, "Código do conselho deve ter no máximo 15 caracteres")
    .required("Código do conselho é obrigatório"),

  codiConc_UF: yup
    .string()
    .length(2, "UF do conselho deve ter 2 caracteres")
    .required("UF do conselho é obrigatória"),

  status: yup
    .string()
    .oneOf(["A", "I"], "Status deve ser A (Ativo) ou I (Inativo)")
    .required("Status é obrigatório"),

  disponibilidade: yup
    .number()
    .integer("Disponibilidade deve ser um número inteiro")
    .nullable(),
})
