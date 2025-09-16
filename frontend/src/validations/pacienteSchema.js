import * as yup from "yup";

// Função auxiliar para validar CPF
const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

// Função para validar data de nascimento (mínimo 1 ano, máximo 120 anos)
const validateBirthDate = (date) => {
  if (!date) return false;
  
  const birthDate = new Date(date);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 1);
  
  return birthDate >= minDate && birthDate <= maxDate;
};

export const pacienteSchema = yup.object({
  nomeComp: yup
    .string()
    .trim()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome não pode ter mais de 50 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, "O nome deve conter apenas letras")
    .required("O nome é obrigatório"),

  cpf: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : ""))
    .test('cpf-length', 'O CPF deve ter exatamente 11 números', value => value?.length === 11)
    .test('cpf-valid', 'CPF inválido', value => validateCPF(value))
    .required("O CPF é obrigatório"),

  rg: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : ""))
    .test('rg-length', 'O RG deve ter entre 7 e 9 números', value => 
      !value || (value.length >= 7 && value.length <= 9))
    .nullable(),

  dataNasc: yup
    .date()
    .typeError("Data de nascimento inválida")
    .test('data-valida', 'Data de nascimento deve ser entre 1 e 120 anos atrás', value => 
      validateBirthDate(value))
    .required("Data de nascimento é obrigatória"),

  sexo: yup
    .string()
    .oneOf(["M", "F", "O"], "Sexo inválido. Use M, F ou O")
    .required("O sexo é obrigatório"),

  logradouro: yup
    .string()
    .trim()
    .min(3, "O logradouro deve ter pelo menos 3 caracteres")
    .max(100, "O logradouro não pode ter mais de 100 caracteres")
    .required("O logradouro é obrigatório"),

  numero: yup
    .string()
    .trim()
    .max(10, "O número não pode ter mais de 10 caracteres")
    .required("O número é obrigatório"),

  complemento: yup
    .string()
    .trim()
    .max(50, "O complemento não pode ter mais de 50 caracteres")
    .nullable(),

  bairro: yup
    .string()
    .trim()
    .min(3, "O bairro deve ter pelo menos 3 caracteres")
    .max(50, "O bairro não pode ter mais de 50 caracteres")
    .required("O bairro é obrigatório"),

  cidade: yup
    .string()
    .trim()
    .min(3, "A cidade deve ter pelo menos 3 caracteres")
    .max(50, "A cidade não pode ter mais de 50 caracteres")
    .nullable(),

  estado: yup
    .string()
    .length(2, "O estado deve ter 2 caracteres")
    .matches(/^[A-Z]{2}$/, "O estado deve ser uma sigla válida (ex: SP, RJ)")
    .required("O estado é obrigatório"),

  cep: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : ""))
    .test('cep-length', 'O CEP deve ter exatamente 8 números', value => value?.length === 8)
    .required("O CEP é obrigatório"),

  telefone: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : ""))
    .test('telefone-length', 'O telefone deve ter 10 ou 11 números', value => 
      value?.length === 10 || value?.length === 11)
    .required("O telefone é obrigatório"),

  email: yup
    .string()
    .email("E-mail inválido")
    .max(80, "O e-mail não pode ter mais de 80 caracteres")
    .required("O e-mail é obrigatório"),

  status: yup
    .string()
    .oneOf(["A", "I"], "Status inválido. Use A (Ativo) ou I (Inativo)")
    .required("O status é obrigatório"),

  responsavel: yup
    .string()
    .trim()
    .max(50, "O responsável não pode ter mais de 50 caracteres")
    .nullable(),

  tipoSangue: yup
    .string()
    .matches(/^(A|B|AB|O)[+-]$/, "Tipo sanguíneo inválido. Use formato: A+, B-, AB+, O-")
    .nullable(),

  alergia: yup
    .string()
    .trim()
    .max(100, "A alergia não pode ter mais de 100 caracteres")
    .nullable(),

  histDoencas: yup
    .string()
    .trim()
    .max(255, "Histórico de doenças muito longo")
    .nullable(),

  observacao: yup
    .string()
    .trim()
    .max(255, "Observação muito longa")
    .nullable(),

  // Campos que existem no backend mas não no formulário frontend
  codiPais: yup
    .string()
    .default("BRA")
    .length(3, "Código do país deve ter 3 caracteres"),
    
  codiCidade: yup
    .string()
    .default("01")
    .length(2, "Código da cidade deve ter 2 caracteres")
}).test('dependent-fields', 'Códigos de país e cidade são obrigatórios', function(value) {
  // Se algum dos campos codiPais ou codiCidade for preenchido, ambos devem estar preenchidos
  if (value.codiPais || value.codiCidade) {
    return value.codiPais && value.codiCidade;
  }
  return true;
});