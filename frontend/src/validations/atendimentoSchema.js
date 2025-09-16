// validations/atendimentoSchema.js
import * as yup from "yup"

export const atendimentoSchema = yup.object().shape({
  tipoAten: yup
    .string()
    .required("Tipo de atendimento é obrigatório")
    .max(3, "Tipo deve ter no máximo 3 caracteres")
    .matches(/^[A-Za-z]+$/, "Tipo deve conter apenas letras"),
  
  justAten: yup
    .string()
    .nullable()
    .max(255, "Justificativa deve ter no máximo 255 caracteres"),
  
  codiAten: yup
    .string()
    .required("Código de atendimento é obrigatório")
    .max(6, "Código deve ter no máximo 6 caracteres")
    .matches(/^[A-Z0-9]+$/, "Código deve conter apenas letras maiúsculas e números")
    .transform((value) => value ? value.toUpperCase() : value) // Converte para maiúsculas
});