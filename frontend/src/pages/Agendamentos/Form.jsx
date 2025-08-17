import React, { useState } from 'react'
import FormField from '../../components/FormField'
import { saveSchedule } from '../../services/schedules'

export default function AgendamentoForm(){
  const [data, setData] = useState({
    date:'', time:'', patientId:'', professionalId:'',
    type:'consulta', status:'marcado',
    reason:'', channel:'online', duration:30
  })
  const onChange = (k,v)=> setData(d=>({ ...d, [k]: v }))

  async function onSubmit(e){
    e.preventDefault()
    await saveSchedule(data)
    history.back()
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Novo Agendamento</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <FormField label="Data"><input className="input" type="date" value={data.date} onChange={e=>onChange('date', e.target.value)} /></FormField>
        <FormField label="Hora"><input className="input" type="time" value={data.time} onChange={e=>onChange('time', e.target.value)} /></FormField>

        <FormField label="Paciente (ID)"><input className="input" value={data.patientId} onChange={e=>onChange('patientId', e.target.value)} /></FormField>
        <FormField label="Profissional (ID)"><input className="input" value={data.professionalId} onChange={e=>onChange('professionalId', e.target.value)} /></FormField>

        <FormField label="Tipo">
          <select className="input" value={data.type} onChange={e=>onChange('type', e.target.value)}>
            <option value="consulta">Consulta</option>
            <option value="retorno">Retorno</option>
            <option value="exame">Exame</option>
          </select>
        </FormField>

        <FormField label="Status">
          <select className="input" value={data.status} onChange={e=>onChange('status', e.target.value)}>
            <option value="marcado">Marcado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="realizado">Realizado</option>
          </select>
        </FormField>

        <FormField label="Motivo"><input className="input" value={data.reason} onChange={e=>onChange('reason', e.target.value)} /></FormField>
        <FormField label="Canal">
          <select className="input" value={data.channel} onChange={e=>onChange('channel', e.target.value)}>
            <option value="telefone">Telefone</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="online">Online</option>
          </select>
        </FormField>
        <FormField label="Tempo estimado (min)"><input className="input" type="number" value={data.duration} onChange={e=>onChange('duration', e.target.value)} /></FormField>
      </div>
      <button className="button" style={{marginTop:12}}>Salvar</button>
    </form>
  )
}
