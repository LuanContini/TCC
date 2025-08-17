import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormField from '../../components/FormField'
import { getProfessional, saveProfessional } from '../../services/professionals'

const empty = {
  name:'', cpf:'', reg:'', specialty:'',
  email:'', phone:'',
  schedule: '', // ex.: "Seg-Sex 08:00-12:00, 14:00-18:00"
  personalCalendarUrl:'', // URL de agenda pessoal (Google Calendar)
  active:true
}

export default function ProfissionalForm(){
  const [data, setData] = useState(empty)
  const { id } = useParams()
  const nav = useNavigate()
  useEffect(()=>{ if(id){ getProfessional(id).then(setData) } },[id])
  const onChange = (k,v)=> setData(d=>({ ...d, [k]: v }))

  async function onSubmit(e){
    e.preventDefault()
    await saveProfessional({ id, ...data })
    nav('/profissionais')
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>{id ? 'Editar' : 'Novo'} Profissional</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <FormField label="Nome completo"><input className="input" value={data.name} onChange={e=>onChange('name', e.target.value)} /></FormField>
        <FormField label="CPF"><input className="input" value={data.cpf} onChange={e=>onChange('cpf', e.target.value)} /></FormField>
        <FormField label="CRM/COREN"><input className="input" value={data.reg} onChange={e=>onChange('reg', e.target.value)} /></FormField>
        <FormField label="Especialidade"><input className="input" value={data.specialty} onChange={e=>onChange('specialty', e.target.value)} /></FormField>
        <FormField label="E-mail"><input className="input" value={data.email} onChange={e=>onChange('email', e.target.value)} /></FormField>
        <FormField label="Telefone"><input className="input" value={data.phone} onChange={e=>onChange('phone', e.target.value)} /></FormField>
        <FormField label="Horários de atendimento (texto)">
          <input className="input" placeholder="Seg-Sex 08:00-12:00, 14:00-18:00"
            value={data.schedule} onChange={e=>onChange('schedule', e.target.value)} />
        </FormField>
        <FormField label="Agenda pessoal (URL)">
          <input className="input" placeholder="https://calendar.google.com/..."
            value={data.personalCalendarUrl} onChange={e=>onChange('personalCalendarUrl', e.target.value)} />
        </FormField>
        <FormField label="Status">
          <select className="input" value={data.active ? 'ativo':'inativo'} onChange={e=>onChange('active', e.target.value==='ativo')}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </FormField>
      </div>
      <button className="button" style={{marginTop:12}}>Salvar</button>
    </form>
  )
}
