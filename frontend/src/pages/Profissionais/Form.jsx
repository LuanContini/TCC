import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { IMaskInput } from 'react-imask'
import FormField from '../../components/FormField'
import { getprofissionais, saveprofissionais } from '../../services/profissionais'
import { profissionalSchema } from '../../validations/profissionalSchema'

const empty = {
  nomeComp:'', cpf:'', rg:'', tipoConc:'', codiConc:'', codiConc_UF:'',
  email:'', telefone:'', logradouro:'', numero:'', complemento:'',
  bairro:'', cidade:'', estado:'', cep:'', codiPais:'', codiCidade:'',
  disponibilidade: null,
  status: 'A',
  sexo: ''
}

export default function ProfissionalForm(){
  const { id } = useParams()
  const nav = useNavigate()

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm({
    resolver: yupResolver(profissionalSchema),
    defaultValues: empty
  });

  useEffect(()=>{
    if(id){
      getprofissionais(id).then(d=>{
        d.cpf = d.cpf?.replace(/\D/g,'')
        d.telefone = d.telefone?.replace(/\D/g,'')
        d.cep = d.cep?.replace(/\D/g,'')
        if(d.dataNasc){
          d.dataNasc = d.dataNasc.split('T')[0];
        }
        reset(d)
      })
    }
  }, [id, reset])

  const onSubmit = async (formData) => {
    const { criadoEm, atualizadoEm, ...cleanData } = formData;
    if(cleanData.dataNasc instanceof Date){
      cleanData.dataNasc = cleanData.dataNasc.toISOString().split('T')[0];
    }

    try {
      await saveprofissionais(cleanData);
      nav('/profissionais');
    } catch (error) {
      const backendErrors = error.response?.data;
      console.error('Erro ao salvar:', backendErrors);
      if (backendErrors) {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          setError(field, { type: 'server', message: messages.join(', ') })
        });
      } else {
        alert("Erro inesperado ao salvar.");
      }
    }
  };

  const estadosBrasil = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
    "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
  ]

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>{id ? 'Editar' : 'Novo'} Profissional</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>

        <FormField label="Nome completo">
          <input className="input" {...register("nomeComp")} placeholder="Ex: João da Silva" />
          {errors.nomeComp && <p>{errors.nomeComp.message}</p>}
        </FormField>

        <FormField label="CPF">
          <Controller
            name="cpf"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="000.000.000-00"
                value={value}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: 123.456.789-00"
              />
            )}
          />
          {errors.cpf && <p>{errors.cpf.message}</p>}
        </FormField>

        <FormField label="RG">
          <Controller
            name="rg"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="00.000.000-0"
                value={value}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: 12.345.678-9"
              />
            )}
          />
          {errors.rg && <p>{errors.rg.message}</p>}
        </FormField>

        <FormField label="Data de Nascimento">
          <Controller
            name="dataNasc"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                className="input"
                {...field}
                max={new Date().toISOString().split("T")[0]}
              />
            )}
          />
          {errors.dataNasc && <p>{errors.dataNasc.message}</p>}
        </FormField>

        <FormField label="Sexo">
          <Controller
            name="sexo"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            )}
          />
          {errors.sexo && <p>{errors.sexo.message}</p>}
        </FormField>

        <FormField label="Telefone">
          <Controller
            name="telefone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="(00)00000-0000"
                value={value}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: (11)91234-5678"
              />
            )}
          />
          {errors.telefone && <p>{errors.telefone.message}</p>}
        </FormField>

        <FormField label="CEP">
          <Controller
            name="cep"
            control={control}
            render={({ field: { onChange, value } }) => (
              <IMaskInput
                mask="00000-000"
                value={value}
                onAccept={val => onChange(val.replace(/\D/g,''))}
                className="input"
                placeholder="Ex: 12345-678"
              />
            )}
          />
          {errors.cep && <p>{errors.cep.message}</p>}
        </FormField>

        <FormField label="E-mail">
          <input className="input" {...register("email")} placeholder="Ex: email@dominio.com" />
          {errors.email && <p>{errors.email.message}</p>}
        </FormField>

        <FormField label="Logradouro">
          <input className="input" {...register("logradouro")} placeholder="Ex: Rua das Flores" />
          {errors.logradouro && <p>{errors.logradouro.message}</p>}
        </FormField>

        <FormField label="Número">
          <input 
            className="input" 
            {...register("numero")} 
            placeholder="Ex: 123" 
            maxLength={10}
            minLength={1} 
            />
          {errors.numero && <p>{errors.numero.message}</p>}
        </FormField>

        <FormField label="Complemento">
          <input className="input" {...register("complemento")} placeholder="Ex: Apto 101" />
        </FormField>

        <FormField label="Bairro">
          <input className="input" {...register("bairro")} placeholder="Ex: Centro" />
          {errors.bairro && <p>{errors.bairro.message}</p>}
        </FormField>

        <FormField label="Cidade">
          <input className="input" {...register("cidade")} placeholder="Ex: São Paulo" />
          {errors.cidade && <p>{errors.cidade.message}</p>}
        </FormField>

        <FormField label="Estado">
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                <option value="">Selecione...</option>
                {estadosBrasil.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            )}
          />
          {errors.estado && <p>{errors.estado.message}</p>}
        </FormField>

        <FormField label="Código do país">
          <input 
            className="input" 
            {...register("codiPais")} 
            placeholder="Ex: 105" 
            maxLength={3}
            minLength={2} 
            />
          {errors.codiPais && <p>{errors.codiPais.message}</p>}
        </FormField>

        <FormField label="Código da cidade">
          <input 
            className="input" 
            {...register("codiCidade")} 
            placeholder="Ex: 12" 
            maxLength={2}
            minLength={2} 
            style={{ textTransform: 'uppercase' }}

            />
          {errors.codiCidade && <p>{errors.codiCidade.message}</p>}
        </FormField>

        <FormField label="Tipo de conselho">
          <input 
            className="input" 
            {...register("tipoConc")} 
            placeholder="Ex: CRM" 
            maxLength={5}
            minLength={2} 
            />
          {errors.tipoConc && <p>{errors.tipoConc.message}</p>}
        </FormField>

        <FormField label="Código do conselho">
          <input 
            className="input" 
            {...register("codiConc")} 
            placeholder="Ex: 12345"
            maxLength={15}
            minLength={3}  />
          {errors.codiConc && <p>{errors.codiConc.message}</p>}
        </FormField>

        <FormField label="UF do conselho">
          <Controller
            name="codiConc_UF"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                <option value="">Selecione...</option>
                {estadosBrasil.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            )}
          />
          {errors.codiConc_UF && <p>{errors.codiConc_UF.message}</p>}
        </FormField>


        <FormField label="Disponibilidade (número inteiro)">
          <input type="number" className="input" {...register("disponibilidade")} placeholder="Ex: 20" />
          {errors.disponibilidade && <p>{errors.disponibilidade.message}</p>}
        </FormField>

        <FormField label="Status">
          <select className="input" {...register("status")}>
            <option value="A">Ativo</option>
            <option value="I">Inativo</option>
          </select>
          {errors.status && <p>{errors.status.message}</p>}
        </FormField>
      </div>
         
      <button className="button" style={{marginTop:12}} type='submit'>Salvar</button>
    </form>
  )
}
