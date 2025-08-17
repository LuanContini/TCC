import * as yup from "yup"

export const atendimentoSchema = yup.object({
  tipoAten: yup.string().length(3, "Deve ter 3 caracteres").required(),
  justAten: yup.string().max(255),
  codiAten: yup.string().length(6, "Código deve ter 6 caracteres").required(),
})
