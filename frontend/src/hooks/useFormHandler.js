import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useFormHandler = (schema, defaultValues, options = {}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    context: options.context, 
    ...options
  });

  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const navigate = useNavigate();

  // Função para tratar erros do backend
  const handleServerErrors = (error) => {
    const backendErrors = error.response?.data;
    setServerErrors([]);

    if (backendErrors) {
      // Erros de validação do servidor (por campo)
      if (backendErrors.detalhes) {
        Object.entries(backendErrors.detalhes).forEach(([field, messages]) => {
          setError(field, { 
            type: 'server', 
            message: Array.isArray(messages) ? messages.join(', ') : messages 
          });
        });
      }
      
      // Erros gerais do servidor
      if (backendErrors.error && !backendErrors.detalhes) {
        setServerErrors([backendErrors.error]);
      }
      
      // Erros de campos únicos (como CPF/Email duplicado)
      if (backendErrors.message) {
        const uniqueFieldErrors = {
          'cpf': 'CPF já cadastrado',
          'email': 'Email já cadastrado',
          'rg': 'RG já cadastrado',
          'codiConc': 'Código do conselho já cadastrado'
        };

        Object.keys(uniqueFieldErrors).forEach(field => {
          if (backendErrors.message.toLowerCase().includes(field)) {
            setError(field, { 
              type: 'server', 
              message: uniqueFieldErrors[field]
            });
          }
        });

        // Se não for um erro de campo único, adiciona como erro geral
        if (!Object.keys(uniqueFieldErrors).some(field => 
          backendErrors.message.toLowerCase().includes(field)
        )) {
          setServerErrors([backendErrors.message]);
        }
      }
    } else {
      setServerErrors(['Erro inesperado ao processar a requisição']);
    }
  };

  // Função para submeter o formulário
  const onSubmitHandler = async (formData, saveFunction, successRedirect, successMessage) => {
    setLoading(true);
    setServerErrors([]);

    try {
      await saveFunction(formData);
      
      if (successMessage) {
        alert(successMessage);
      }
      
      if (successRedirect) {
        navigate(successRedirect);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      handleServerErrors(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar todos os erros
  const clearErrors = () => {
    setServerErrors([]);
  };

  return {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    watch,
    errors,
    loading,
    setLoading,
    serverErrors,
    setServerErrors,
    onSubmitHandler,
    clearErrors,
    navigate
  };
};