import * as yup from "yup"

export const atendimentoSchema = yup.object().shape({
  tipoAten: yup.string().required("Tipo de atendimento é obrigatório").max(3),
  justAten: yup.string().max(255),
  codiAten: yup.string().required("Código é obrigatório").max(6),
})
