import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import FormField from '../../components/FormField'
import { saveSchedule } from '../../services/schedules'
import { agendamentoSchema } from '../../validations/agendamentoSchema'

export default function AgendamentoForm(){
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: yupResolver(agendamentoSchema),
    defaultValues: {
      date:'', time:'', patientId:'', professionalId:'',
      type:'consulta', status:'marcado', reason:'', channel:'online', duration:30
    }
  })

  const onSubmit = async (formData) => {
    await saveSchedule(formData)
    history.back()
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Novo Agendamento</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>

        <FormField label="Data">
          <input type="date" className="input" {...register("date")} />
          {errors.date && <p>{errors.date.message}</p>}
        </FormField>

        <FormField label="Hora">
          <input type="time" className="input" {...register("time")} />
          {errors.time && <p>{errors.time.message}</p>}
        </FormField>

        <FormField label="Paciente (ID)">
          <input className="input" {...register("patientId")} />
          {errors.patientId && <p>{errors.patientId.message}</p>}
        </FormField>

        <FormField label="Profissional (ID)">
          <input className="input" {...register("professionalId")} />
          {errors.professionalId && <p>{errors.professionalId.message}</p>}
        </FormField>

        <FormField label="Tipo">
          <select className="input" {...register("type")}>
            <option value="consulta">Consulta</option>
            <option value="retorno">Retorno</option>
            <option value="exame">Exame</option>
          </select>
          {errors.type && <p>{errors.type.message}</p>}
        </FormField>

        <FormField label="Status">
          <select className="input" {...register("status")}>
            <option value="marcado">Marcado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="realizado">Realizado</option>
          </select>
          {errors.status && <p>{errors.status.message}</p>}
        </FormField>

        <FormField label="Motivo">
          <input className="input" {...register("reason")} />
          {errors.reason && <p>{errors.reason.message}</p>}
        </FormField>

        <FormField label="Canal">
          <select className="input" {...register("channel")}>
            <option value="telefone">Telefone</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="online">Online</option>
          </select>
          {errors.channel && <p>{errors.channel.message}</p>}
        </FormField>

        <FormField label="Tempo estimado (min)">
          <input type="number" className="input" {...register("duration")} />
          {errors.duration && <p>{errors.duration.message}</p>}
        </FormField>

      </div>
      <button className="button" style={{marginTop:12}}>Salvar</button>
    </form>
  )
}
