import React, { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import FormField from '../../components/FormField'
import { saveEncounter, savePrescription, uploadExam } from '../../services/clinical'
import { atendimentoSchema } from '../../validations/atendimentoSchema'

export default function Atendimento(){
  const inputRef = useRef()
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm({
    resolver: yupResolver(atendimentoSchema),
    defaultValues: {
      patientId:'', symptoms:'', diagnosis:'', notes:'',
      alerts:'', prescriptionText:''
    }
  })

  const files = watch('files') || []

  const onSaveEncounter = async (data) => {
    await saveEncounter(data)
    alert('Atendimento salvo.')
  }

  const onSavePrescription = async (data) => {
    await savePrescription({ patientId: data.patientId, text: data.prescriptionText })
    alert('Prescrição salva.')
  }

  const onUploadFiles = async (patientId, files2) => {
  const fileList = files2 || []  // garante array mesmo se undefined
  if (!fileList.length || !patientId) return
  for (const f of fileList) await uploadExam(patientId, f)
  alert('Arquivos enviados.')
}


  return (
    <form className="card" onSubmit={handleSubmit(onSaveEncounter)}>
      <h2>Atendimento Clínico</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>

        <FormField label="Paciente (ID)">
          <input className="input" {...register("patientId")} />
          {errors.patientId && <p>{errors.patientId.message}</p>}
        </FormField>

        <FormField label="Alertas (somente leitura)">
          <input className="input" {...register("alerts")} readOnly placeholder="Ex.: Alergia grave a penicilina" />
        </FormField>

        <FormField label="Sintomas">
          <textarea className="input" rows={3} {...register("symptoms")} />
          {errors.symptoms && <p>{errors.symptoms.message}</p>}
        </FormField>

        <FormField label="Diagnóstico">
          <textarea className="input" rows={3} {...register("diagnosis")} />
          {errors.diagnosis && <p>{errors.diagnosis.message}</p>}
        </FormField>

        <FormField label="Anotações (evolução)">
          <textarea className="input" rows={4} {...register("notes")} />
          {errors.notes && <p>{errors.notes.message}</p>}
        </FormField>

        <FormField label="Prescrição (texto)">
          <textarea className="input" rows={4} {...register("prescriptionText")} />
          {errors.prescriptionText && <p>{errors.prescriptionText.message}</p>}
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <button type="button" className="button" onClick={() => onSavePrescription(watch())}>Salvar Prescrição</button>
          </div>
        </FormField>

        <FormField label="Upload de exames/imagens">
          <input
            type="file"
            multiple
            ref={inputRef}
            onChange={e => control.setValue("files", e.target.files ? [...e.target.files] : [])}
          />
          <div style={{marginTop:8}}>
            <button type="button" className="button" onClick={() => onUploadFiles(watch("patientId"), watch("files"))}>Enviar</button>
          </div>
        </FormField>

      </div>

      <button className="button" style={{marginTop:12}}>Salvar Atendimento</button>
    </form>
  )
}
