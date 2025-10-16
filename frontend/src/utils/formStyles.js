// Estilos para campos com erro
export const getFieldStyle = (hasError, customStyles = {}) => {
  if (hasError) {
    return {
      borderColor: '#dc2626',
      backgroundColor: '#fdf2f2',
      ...customStyles
    };
  }
  return customStyles;
};

// Mapeamento de mensagens de erro comuns
export const COMMON_ERROR_MESSAGES = {
  REQUIRED: 'Campo obrigatório',
  EMAIL: 'Email inválido',
  CPF: 'CPF inválido',
  PHONE: 'Telefone inválido',
  CEP: 'CEP inválido',
  MIN_LENGTH: (min) => `Mínimo de ${min} caracteres`,
  MAX_LENGTH: (max) => `Máximo de ${max} caracteres`,
  UNIQUE: (field) => `${field} já cadastrado`,
  INVALID_DATE: 'Data inválida'
};

// Função para mascarar valores
export const maskValue = (value, maskType) => {
  const masks = {
    cpf: value?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
    phone: value?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'),
    cep: value?.replace(/(\d{5})(\d{3})/, '$1-$2'),
    rg: value?.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
  };

  return masks[maskType] || value;
};