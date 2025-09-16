import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IMaskInput } from 'react-imask';
import FormField from '../../components/FormField';
import { getProfissionais, saveProfissionais } from '../../services/profissionais';
import { profissionalSchema } from '../../validations/profissionalSchema';

const estadosBrasil = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const empty = {
  nomeComp:'', cpf:'', rg:'', tipoConc:'', codiConc:'', codiConc_UF:'',
  email:'', telefone:'', logradouro:'', numero:'', complemento:'',
  bairro:'', cidade:'', estado:'', cep:'', codiPais:'', codiCidade:'',
  dataNasc:'', disponibilidade:'', status:'A', sexo:''
};

export default function ProfissionalForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm({
    resolver: yupResolver(profissionalSchema),
    defaultValues: empty
  });

  useEffect(() => {
    if(id){
      setLoading(true);
      (async () => {
        try {
          const d = await getProfissionais(id);
          reset({
            ...empty,
            ...d,
            cpf: d.cpf?.replace(/\D/g,'') || '',
            telefone: d.telefone?.replace(/\D/g,'') || '',
            cep: d.cep?.replace(/\D/g,'') || '',
            dataNasc: d.dataNasc ? d.dataNasc.split('T')[0] : '',
            sexo: d.sexo || '',
            estado: d.estado || '',
            status: d.status || 'A'
          });
        } catch(e) {
          console.error("Erro ao buscar profissional:", e);
          alert("Erro ao carregar dados do profissional");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, reset]);

  const onSubmit = async (formData) => {
    setLoading(true);
    const { criadoEm, atualizadoEm, ...cleanData } = formData;

    if(cleanData.dataNasc instanceof Date){
      cleanData.dataNasc = cleanData.dataNasc.toISOString().split('T')[0];
    }

    try {
      await saveProfissionais(cleanData);
      nav('/profissionais');
    } catch (error) {
      const backendErrors = error.response?.data;
      console.error('Erro ao salvar:', backendErrors);
      if (backendErrors) {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          setError(field, { type: 'server', message: Array.isArray(messages) ? messages.join(', ') : messages });
        });
      } else {
        alert("Erro inesperado ao salvar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente personalizado para mostrar erros
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    
    return (
      <div style={{ 
        color: '#e74c3c', 
        fontSize: '0.875rem', 
        marginTop: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <span style={{ fontSize: '1rem' }}>⚠️</span>
        {error.message}
      </div>
    );
  };

  // Estilo para campos com erro
  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? {
      borderColor: '#e74c3c',
      backgroundColor: '#fdf2f2'
    } : {};
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{id ? "Editar" : "Novo"} Profissional</h2>
          {Object.keys(errors).length > 0 && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              <strong>Por favor, corrija os seguintes erros:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>

        <FormField label="Nome completo" error={errors.nomeComp}>
          <input
            className="input"
            {...register("nomeComp")}
            placeholder="Ex: João da Silva"
            maxLength={50}
            style={getInputStyle('nomeComp')}
          />
          <ErrorMessage error={errors.nomeComp} />
        </FormField>

        <FormField label="CPF" error={errors.cpf}>
          <Controller
            name="cpf"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="000.000.000-00"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: 123.456.789-00"
                style={getInputStyle('cpf')}
              />
            )}
          />
          <ErrorMessage error={errors.cpf} />
        </FormField>

        <FormField label="RG" error={errors.rg}>
          <Controller
            name="rg"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="00.000.000-0"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: 12.345.678-9"
                style={getInputStyle('rg')}
              />
            )}
          />
          <ErrorMessage error={errors.rg} />
        </FormField>

        <FormField label="Data de Nascimento" error={errors.dataNasc}>
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
                style={getInputStyle('dataNasc')}
              />
            )}
          />
          <ErrorMessage error={errors.dataNasc} />
        </FormField>

        <FormField label="Sexo" error={errors.sexo}>
          <Controller
            name="sexo"
            control={control}
            render={({ field }) => (
              <select {...field} className="input" value={field.value || ''} style={getInputStyle('sexo')}>
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            )}
          />
          <ErrorMessage error={errors.sexo} />
        </FormField>

        <FormField label="Telefone" error={errors.telefone}>
          <Controller
            name="telefone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="(00)00000-0000"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: (11)91234-5678"
                style={getInputStyle('telefone')}
              />
            )}
          />
          <ErrorMessage error={errors.telefone} />
        </FormField>

        <FormField label="CEP" error={errors.cep}>
          <Controller
            name="cep"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="00000-000"
                value={value || ''}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: 12345-678"
                style={getInputStyle('cep')}
              />
            )}
          />
          <ErrorMessage error={errors.cep} />
        </FormField>

        <FormField label="E-mail" error={errors.email}>
          <input
            className="input"
            {...register("email")}
            placeholder="Ex: email@dominio.com"
            maxLength={80}
            style={getInputStyle('email')}
          />
          <ErrorMessage error={errors.email} />
        </FormField>

        <FormField label="Logradouro" error={errors.logradouro}>
          <input
            className="input"
            {...register("logradouro")}
            placeholder="Ex: Rua das Flores"
            maxLength={100}
            style={getInputStyle('logradouro')}
          />
          <ErrorMessage error={errors.logradouro} />
        </FormField>

        <FormField label="Número" error={errors.numero}>
          <input
            className="input"
            {...register("numero")}
            placeholder="Ex: 123"
            maxLength={10}
            style={getInputStyle('numero')}
          />
          <ErrorMessage error={errors.numero} />
        </FormField>

        <FormField label="Complemento" error={errors.complemento}>
          <input
            className="input"
            {...register("complemento")}
            placeholder="Ex: Apto 101"
            maxLength={50}
            style={getInputStyle('complemento')}
          />
          <ErrorMessage error={errors.complemento} />
        </FormField>

        <FormField label="Bairro" error={errors.bairro}>
          <input
            className="input"
            {...register("bairro")}
            placeholder="Ex: Centro"
            maxLength={50}
            style={getInputStyle('bairro')}
          />
          <ErrorMessage error={errors.bairro} />
        </FormField>

        <FormField label="Cidade" error={errors.cidade}>
          <input
            className="input"
            {...register("cidade")}
            placeholder="Ex: São Paulo"
            maxLength={50}
            style={getInputStyle('cidade')}
          />
          <ErrorMessage error={errors.cidade} />
        </FormField>

        <FormField label="Estado" error={errors.estado}>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <select {...field} className="input" value={field.value || ''} style={getInputStyle('estado')}>
                <option value="">Selecione...</option>
                {estadosBrasil.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            )}
          />
          <ErrorMessage error={errors.estado} />
        </FormField>

        <FormField label="Código do país" error={errors.codiPais}>
          <input
            className="input"
            {...register("codiPais")}
            placeholder="Ex: 105"
            maxLength={3}
            minLength={3}
            style={getInputStyle('codiPais')}
          />
          <ErrorMessage error={errors.codiPais} />
        </FormField>

        <FormField label="Código da cidade" error={errors.codiCidade}>
          <input
            className="input"
            {...register("codiCidade")}
            placeholder="Ex: 12"
            maxLength={2}
            minLength={2}
            style={getInputStyle('codiCidade')}
          />
          <ErrorMessage error={errors.codiCidade} />
        </FormField>

        <FormField label="Tipo de conselho" error={errors.tipoConc}>
          <input
            className="input"
            {...register("tipoConc")}
            placeholder="Ex: CRM"
            maxLength={5}
            style={getInputStyle('tipoConc')}
          />
          <ErrorMessage error={errors.tipoConc} />
        </FormField>

        <FormField label="Código do conselho" error={errors.codiConc}>
          <input
            className="input"
            {...register("codiConc")}
            placeholder="Ex: 12345"
            maxLength={15}
            style={getInputStyle('codiConc')}
          />
          <ErrorMessage error={errors.codiConc} />
        </FormField>

        <FormField label="UF do conselho" error={errors.codiConc_UF}>
          <Controller
            name="codiConc_UF"
            control={control}
            render={({ field }) => (
              <select {...field} className="input" value={field.value || ''} style={getInputStyle('codiConc_UF')}>
                <option value="">Selecione...</option>
                {estadosBrasil.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            )}
          />
          <ErrorMessage error={errors.codiConc_UF} />
        </FormField>

        <FormField label="Disponibilidade" error={errors.disponibilidade}>
          <input
            type="number"
            className="input"
            {...register("disponibilidade")}
            placeholder="Ex: 20"
            style={getInputStyle('disponibilidade')}
          />
          <ErrorMessage error={errors.disponibilidade} />
        </FormField>

        <FormField label="Status" error={errors.status}>
          <select 
            className="input" 
            {...register("status")}
            style={getInputStyle('status')}
          >
            <option value="A">Ativo</option>
            <option value="I">Inativo</option>
          </select>
          <ErrorMessage error={errors.status} />
        </FormField>

      </div>
    </form>
  );
}