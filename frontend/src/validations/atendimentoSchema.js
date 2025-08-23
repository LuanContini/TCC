import * as yup from "yup";

export const atendimentoSchema = yup.object({
  patientId: yup
    .number()
    .typeError("ID do paciente deve ser um número")
    .required("Paciente é obrigatório"),

  symptoms: yup
    .string()
    .max(500, "Sintomas deve ter no máximo 500 caracteres")
    .required("Sintomas são obrigatórios"),

  diagnosis: yup
    .string()
    .max(500, "Diagnóstico deve ter no máximo 500 caracteres")
    .required("Diagnóstico é obrigatório"),

  notes: yup
    .string()
    .max(1000, "Anotações devem ter no máximo 1000 caracteres")
    .nullable(),

  alerts: yup
    .string()
    .max(255, "Alertas devem ter no máximo 255 caracteres")
    .nullable(),

  prescriptionText: yup
    .string()
    .max(1000, "Prescrição deve ter no máximo 1000 caracteres")
    .nullable(),
});
