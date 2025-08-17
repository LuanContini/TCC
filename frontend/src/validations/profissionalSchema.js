import * as yup from "yup"

export const profissionalSchema = yup.object({
  nomeComp: yup.string().max(50).required(),
  cpf: yup.string().matches(/^\d{11}$/, "CPF deve ter 11 números").required(),
  rg: yup.string().matches(/^\d{9}$/, "RG deve ter 9 números").nullable(),
  dataNasc: yup.date().required(),
  sexo: yup.string().oneOf(["M", "F", "O"]).required(),
  logradouro: yup.string().max(100).required(),
  numero: yup.string().max(10).required(),
  complemento: yup.string().max(50).nullable(),
  bairro: yup.string().max(50).required(),
  cidade: yup.string().max(50),
  estado: yup.string().length(2).required(),
  cep: yup.string().matches(/^\d{8}$/, "CEP deve ter 8 números").required(),
  codiPais: yup.string().length(3).required(),
  codiCidade: yup.string().length(2).required(),
  telefone: yup.string().matches(/^\d{11}$/, "Telefone deve ter 11 números").required(),
  email: yup.string().email().max(80).required(),
  tipoConc: yup.string().max(5).required(),
  codiConc: yup.string().max(15).required(),
  codiConc_UF: yup.string().length(2).required(),
  status: yup.string().oneOf(["A", "I"]).required(), // Ex.: A = ativo, I = inativo
  disponibilidade: yup.number().integer().nullable(),
})
