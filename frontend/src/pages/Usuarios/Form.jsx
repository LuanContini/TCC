import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';

// Componentes e hooks
import { EnhancedFormField } from '../../components/EnhancedFormField';
import { FormErrors } from '../../components/FormErrors';
import { useFormHandler } from '../../hooks/useFormHandler';
import { getUsuario, saveUsuario } from '../../services/usuarios';
import { usuarioSchema } from '../../validations/usuarioSchema';
import { useAuth } from '../../context/AuthContext';

const empty = {
  nome: '',
  email: '',
  senha: '',
  role: ''
};

export default function UsuarioForm() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    errors,
    loading,
    setLoading,
    serverErrors,
    onSubmitHandler,
    navigate
  } = useFormHandler(usuarioSchema, empty, { context: { id } });

  useEffect(() => {
    if (id) {
      setLoading(true);
      (async () => {
        try {
          const usuarioData = await getUsuario(id);
          reset({
            ...empty,
            ...usuarioData,
            senha: '' // Não carrega a senha por segurança
          });
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          alert('Erro ao carregar dados do usuário');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, reset, setLoading]);

  const onSubmit = async (formData) => {
    // Se é edição e senha não foi alterada, remove o campo
    if (id && !formData.senha) {
      const { senha, ...dataWithoutPassword } = formData;
      await onSubmitHandler(
        { ...dataWithoutPassword, id },
        saveUsuario,
        '/usuarios',
        `Usuário atualizado com sucesso!`
      );
    } else {
      await onSubmitHandler(
        { ...formData, id },
        saveUsuario,
        '/usuarios',
        `Usuário ${id ? 'atualizado' : 'cadastrado'} com sucesso!`
      );
    }
  };

  // Verificar se o usuário atual pode editar o role
  const canEditRole = user?.role === 'admin' && (!id || user.id !== parseInt(id));

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>
            {id ? "Editar" : "Novo"} Usuário
          </h2>
        </div>
        <div>
          <button 
            type="button" 
            className="button secondary" 
            onClick={() => navigate(-1)}
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
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* Exibição centralizada de erros */}
      <FormErrors errors={errors} serverErrors={serverErrors} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        <EnhancedFormField label="Nome completo" error={errors.nome} required>
          <input
            className="input"
            {...register("nome")}
            placeholder="Ex: João da Silva"
            maxLength={100}
            disabled={loading}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Email" error={errors.email} required>
          <input
            type="email"
            className="input"
            {...register("email")}
            placeholder="Ex: usuario@email.com"
            maxLength={120}
            disabled={loading}
          />
        </EnhancedFormField>

        <EnhancedFormField 
          label="Senha" 
          error={errors.senha} 
          required={!id}
        >
          <input
            type="password"
            className="input"
            {...register("senha")}
            placeholder={id ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
            disabled={loading}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Perfil" error={errors.role} required>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="input"
                value={field.value || ''}
                disabled={loading || !canEditRole}
              >
                <option value="">Selecione o perfil...</option>
                <option value="admin">Administrador</option>
                <option value="atendente">Atendente</option>
                <option value="medico">Médico</option>
              </select>
            )}
          />
          {!canEditRole && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              {user?.id === parseInt(id) 
                ? "Você não pode alterar seu próprio perfil" 
                : "Apenas administradores podem alterar perfis"
              }
            </div>
          )}
        </EnhancedFormField>

      </div>
    </form>
  );
}