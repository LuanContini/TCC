import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormField from '../../components/FormField';
import { alterarSenha } from '../../services/usuarios';
import { alterarSenhaSchema } from '../../validations/usuarioSchema';
import { useAuth } from '../../context/AuthContext';

export default function AlterarSenha() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: yupResolver(alterarSenhaSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await alterarSenha(user.id, data);
      alert('Senha alterada com sucesso!');
      nav(-1);
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError?.error) {
        setError('senha_atual', { message: backendError.error });
      } else {
        alert('Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div style={{ 
        color: '#e74c3c', 
        fontSize: '0.875rem', 
        marginTop: '0.25rem'
      }}>
        ⚠️ {error.message}
      </div>
    );
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Alterar Senha</h2>
        <div>
          <button 
            type="button" 
            className="button secondary" 
            onClick={() => nav(-1)}
            style={{ marginRight: '0.5rem' }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="button primary" 
            disabled={loading}
          >
            {loading ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <FormField label="Senha Atual" error={errors.senha_atual}>
          <input
            type="password"
            className="input"
            {...register("senha_atual")}
            placeholder="Digite sua senha atual"
            disabled={loading}
          />
          <ErrorMessage error={errors.senha_atual} />
        </FormField>

        <FormField label="Nova Senha" error={errors.nova_senha}>
          <input
            type="password"
            className="input"
            {...register("nova_senha")}
            placeholder="Digite a nova senha"
            disabled={loading}
          />
          <ErrorMessage error={errors.nova_senha} />
        </FormField>
      </div>
    </form>
  );
}