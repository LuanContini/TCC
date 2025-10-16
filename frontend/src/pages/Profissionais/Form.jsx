import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';

// Componentes e hooks
import { EnhancedFormField } from '../../components/EnhancedFormField';
import { FormErrors } from '../../components/FormErrors';
import { useFormHandler } from '../../hooks/useFormHandler';
import { getProfissionais, saveProfissionais } from '../../services/profissionais';
import { profissionalSchema } from '../../validations/profissionalSchema';

// Utilitários
import { estadosBrasil, SEXO_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';

const empty = {
  nomeComp: '', cpf: '', rg: '', tipoConc: '', codiConc: '', codiConc_UF: '',
  email: '', telefone: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', estado: '', cep: '', codiPais: '', codiCidade: '',
  dataNasc: '', disponibilidade: '', status: 'A', sexo: ''
};

export default function ProfissionalForm() {
  const { id } = useParams();
  
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
  } = useFormHandler(profissionalSchema, empty);

  useEffect(() => {
    if (id) {
      setLoading(true);
      (async () => {
        try {
          const data = await getProfissionais(id);
          reset({
            ...empty,
            ...data,
            cpf: data.cpf?.replace(/\D/g, '') || '',
            telefone: data.telefone?.replace(/\D/g, '') || '',
            cep: data.cep?.replace(/\D/g, '') || '',
            dataNasc: data.dataNasc ? data.dataNasc.split('T')[0] : '',
            sexo: data.sexo || '',
            estado: data.estado || '',
            status: data.status || 'A'
          });
        } catch (error) {
          console.error("Erro ao buscar profissional:", error);
          alert("Erro ao carregar dados do profissional");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, reset, setLoading]);

  const onSubmit = async (formData) => {
    const { criadoEm, atualizadoEm, ...cleanData } = formData;

    if (cleanData.dataNasc instanceof Date) {
      cleanData.dataNasc = cleanData.dataNasc.toISOString().split('T')[0];
    }

    await onSubmitHandler(
      cleanData,
      saveProfissionais,
      '/profissionais',
      `Profissional ${id ? 'atualizado' : 'cadastrado'} com sucesso!`
    );
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>
            {id ? "Editar" : "Novo"} Profissional
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

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>

        {/* Dados Pessoais */}
        <EnhancedFormField label="Nome completo" error={errors.nomeComp} required>
          <input
            className="input"
            {...register("nomeComp")}
            placeholder="Ex: João da Silva"
            maxLength={50}
          />
        </EnhancedFormField>

        <EnhancedFormField label="CPF" error={errors.cpf} required>
          <Controller
            name="cpf"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="000.000.000-00"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g, ''))}
                className="input"
                placeholder="Ex: 123.456.789-00"
              />
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="RG" error={errors.rg}>
          <Controller
            name="rg"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="00.000.000-0"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g, ''))}
                className="input"
                placeholder="Ex: 12.345.678-9"
              />
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Data de Nascimento" error={errors.dataNasc} required>
          <Controller
            name="dataNasc"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                className="input"
                {...field}
                value={field.value || ''}
                max={new Date().toISOString().split("T")[0]}
              />
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Sexo" error={errors.sexo} required>
          <Controller
            name="sexo"
            control={control}
            render={({ field }) => (
              <select {...field} className="input" value={field.value || ''}>
                <option value="">Selecione...</option>
                {SEXO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </EnhancedFormField>

        {/* Contato */}
        <EnhancedFormField label="Telefone" error={errors.telefone} required>
          <Controller
            name="telefone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="(00)00000-0000"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g, ''))}
                className="input"
                placeholder="Ex: (11)91234-5678"
              />
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="E-mail" error={errors.email} required>
          <input
            className="input"
            {...register("email")}
            placeholder="Ex: email@dominio.com"
            maxLength={80}
          />
        </EnhancedFormField>

        {/* Endereço */}
        <EnhancedFormField label="CEP" error={errors.cep} required>
          <Controller
            name="cep"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="00000-000"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g, ''))}
                className="input"
                placeholder="Ex: 12345-678"
              />
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Logradouro" error={errors.logradouro} required>
          <input
            className="input"
            {...register("logradouro")}
            placeholder="Ex: Rua das Flores"
            maxLength={100}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Número" error={errors.numero} required>
          <input
            className="input"
            {...register("numero")}
            placeholder="Ex: 123"
            maxLength={10}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Complemento" error={errors.complemento}>
          <input
            className="input"
            {...register("complemento")}
            placeholder="Ex: Apto 101"
            maxLength={50}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Bairro" error={errors.bairro} required>
          <input
            className="input"
            {...register("bairro")}
            placeholder="Ex: Centro"
            maxLength={50}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Cidade" error={errors.cidade}>
          <input
            className="input"
            {...register("cidade")}
            placeholder="Ex: São Paulo"
            maxLength={50}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Estado" error={errors.estado} required>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <select {...field} className="input" value={field.value || ''}>
                <option value="">Selecione...</option>
                {estadosBrasil.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Código do país" error={errors.codiPais} required>
          <input
            className="input"
            {...register("codiPais")}
            placeholder="Ex: 105"
            maxLength={3}
            minLength={3}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Código da cidade" error={errors.codiCidade} required>
          <input
            className="input"
            {...register("codiCidade")}
            placeholder="Ex: 12"
            maxLength={2}
            minLength={2}
          />
        </EnhancedFormField>

        {/* Dados Profissionais */}
        <EnhancedFormField label="Tipo de conselho" error={errors.tipoConc} required>
          <input
            className="input"
            {...register("tipoConc")}
            placeholder="Ex: CRM"
            maxLength={5}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Código do conselho" error={errors.codiConc} required>
          <input
            className="input"
            {...register("codiConc")}
            placeholder="Ex: 12345"
            maxLength={15}
          />
        </EnhancedFormField>

        <EnhancedFormField label="UF do conselho" error={errors.codiConc_UF} required>
          <Controller
            name="codiConc_UF"
            control={control}
            render={({ field }) => (
              <select {...field} className="input" value={field.value || ''}>
                <option value="">Selecione...</option>
                {estadosBrasil.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            )}
          />
        </EnhancedFormField>

        <EnhancedFormField label="Disponibilidade" error={errors.disponibilidade}>
          <input
            type="number"
            className="input"
            {...register("disponibilidade")}
            placeholder="Ex: 20"
            min="0"
          />
        </EnhancedFormField>

        <EnhancedFormField label="Status" error={errors.status} required>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </EnhancedFormField>

      </div>
    </form>
  );
}