import * as yup from "yup";

export const usuarioSchema = yup.object({
  nome: yup
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .required("Nome é obrigatório"),

  email: yup
    .string()
    .email("Email inválido")
    .max(120, "Email deve ter no máximo 120 caracteres")
    .required("Email é obrigatório"),

  senha: yup
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .matches(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .matches(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .matches(/[0-9]/, "Senha deve conter pelo menos um número")
    .when('id', {
      is: (id) => !id, // Senha obrigatória apenas para criação
      then: (schema) => schema.required("Senha é obrigatória"),
      otherwise: (schema) => schema.nullable()
    }),

  role: yup
    .string()
    .oneOf(["admin", "atendente", "medico"], "Role deve ser admin, atendente ou medico")
    .required("Role é obrigatória"),
});

export const alterarSenhaSchema = yup.object({
  senha_atual: yup
    .string()
    .required("Senha atual é obrigatória"),

  nova_senha: yup
    .string()
    .min(6, "Nova senha deve ter pelo menos 6 caracteres")
    .matches(/[A-Z]/, "Nova senha deve conter pelo menos uma letra maiúscula")
    .matches(/[a-z]/, "Nova senha deve conter pelo menos uma letra minúscula")
    .matches(/[0-9]/, "Nova senha deve conter pelo menos um número")
    .required("Nova senha é obrigatória"),
});