import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { IMaskInput } from 'react-imask'
import FormField from '../../components/FormField'
import { getProfessional, saveProfessional } from '../../services/professionals'
import { profissionalSchema } from '../../validations/profissionalSchema'

const empty = {
  nomeComp:'', cpf:'', rg:'', tipoConc:'', codiConc:'', codiConc_UF:'',
  email:'', telefone:'', logradouro:'', numero:'', complemento:'',
  bairro:'', cidade:'', estado:'', cep:'', codiPais:'', codiCidade:'',
  disponibilidade: null,
  status: 'A'
}

export default function ProfissionalForm(){
  const { id } = useParams()
  const nav = useNavigate()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: yupResolver(profissionalSchema),
    defaultValues: empty
  })

  useEffect(()=>{
    if(id){
      getProfessional(id).then(d=>{
        // remover máscaras para formulário
        d.cpf = d.cpf?.replace(/\D/g,'')
        d.telefone = d.telefone?.replace(/\D/g,'')
        d.cep = d.cep?.replace(/\D/g,'')
        reset(d)
      })
    }
  }, [id, reset])

  const onSubmit = async (formData) => {
    await saveProfessional({ id, ...formData })
    nav('/profissionais')
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>{id ? 'Editar' : 'Novo'} Profissional</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>

        <FormField label="Nome completo">
          <input className="input" {...register("nomeComp")} />
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
              />
            )}
          />
          {errors.rg && <p>{errors.rg.message}</p>}
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
              />
            )}
          />
          {errors.cep && <p>{errors.cep.message}</p>}
        </FormField>

        <FormField label="E-mail">
          <input className="input" {...register("email")} />
          {errors.email && <p>{errors.email.message}</p>}
        </FormField>

        <FormField label="Logradouro">
          <input className="input" {...register("logradouro")} />
          {errors.logradouro && <p>{errors.logradouro.message}</p>}
        </FormField>

        <FormField label="Número">
          <input className="input" {...register("numero")} />
          {errors.numero && <p>{errors.numero.message}</p>}
        </FormField>

        <FormField label="Complemento">
          <input className="input" {...register("complemento")} />
        </FormField>

        <FormField label="Bairro">
          <input className="input" {...register("bairro")} />
          {errors.bairro && <p>{errors.bairro.message}</p>}
        </FormField>

        <FormField label="Cidade">
          <input className="input" {...register("cidade")} />
          {errors.cidade && <p>{errors.cidade.message}</p>}
        </FormField>

        <FormField label="Estado">
          <input className="input" {...register("estado")} />
          {errors.estado && <p>{errors.estado.message}</p>}
        </FormField>

        <FormField label="Código do país">
          <input className="input" {...register("codiPais")} />
          {errors.codiPais && <p>{errors.codiPais.message}</p>}
        </FormField>

        <FormField label="Código da cidade">
          <input className="input" {...register("codiCidade")} />
          {errors.codiCidade && <p>{errors.codiCidade.message}</p>}
        </FormField>

        <FormField label="Tipo de conselho">
          <input className="input" {...register("tipoConc")} />
          {errors.tipoConc && <p>{errors.tipoConc.message}</p>}
        </FormField>

        <FormField label="Código do conselho">
          <input className="input" {...register("codiConc")} />
          {errors.codiConc && <p>{errors.codiConc.message}</p>}
        </FormField>

        <FormField label="UF do conselho">
          <input className="input" {...register("codiConc_UF")} />
          {errors.codiConc_UF && <p>{errors.codiConc_UF.message}</p>}
        </FormField>

        <FormField label="Disponibilidade (número inteiro)">
          <input type="number" className="input" {...register("disponibilidade")} />
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

      <button className="button" style={{marginTop:12}}>Salvar</button>
    </form>
  )
}
