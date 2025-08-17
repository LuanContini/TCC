import React, { useRef, useState } from 'react'
import FormField from '../../components/FormField'
import { saveEncounter, savePrescription, uploadExam } from '../../services/clinical'

export default function Atendimento(){
  const [data, setData] = useState({
    patientId:'', symptoms:'', diagnosis:'', notes:'',
    alerts:'', // exibir alertas (ex.: alergia grave) quando vindo do backend
    prescriptionText:''
  })
  const [files, setFiles] = useState([])
  const onChange = (k,v)=> setData(d=>({ ...d, [k]: v }))
  const inputRef = useRef()

  async function onSaveEncounter(e){
    e.preventDefault()
    await saveEncounter(data) // {patientId, symptoms, diagnosis, notes}
    alert('Atendimento salvo.')
  }

  async function onSavePrescription(){
    // Opcional: usar jsPDF para gerar PDF localmente e enviar
    await savePrescription({ patientId: data.patientId, text: data.prescriptionText })
    alert('Prescrição salva.')
  }

  async function onUploadFiles(){
    if(!files.length || !data.patientId) return
    for(const f of files) await uploadExam(data.patientId, f)
    alert('Arquivos enviados.')
  }

  return (
    <form className="card" onSubmit={onSaveEncounter}>
      <h2>Atendimento Clínico</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <FormField label="Paciente (ID)"><input className="input" value={data.patientId} onChange={e=>onChange('patientId', e.target.value)} /></FormField>
        <FormField label="Alertas (somente leitura)">
          <input className="input" value={data.alerts} readOnly placeholder="Ex.: Alergia grave a penicilina" />
        </FormField>

        <FormField label="Sintomas"><textarea className="input" rows={3} value={data.symptoms} onChange={e=>onChange('symptoms', e.target.value)} /></FormField>
        <FormField label="Diagnóstico"><textarea className="input" rows={3} value={data.diagnosis} onChange={e=>onChange('diagnosis', e.target.value)} /></FormField>

        <FormField label="Anotações (evolução)"><textarea className="input" rows={4} value={data.notes} onChange={e=>onChange('notes', e.target.value)} /></FormField>
        <FormField label="Prescrição (texto)">
          <textarea className="input" rows={4} value={data.prescriptionText} onChange={e=>onChange('prescriptionText', e.target.value)} />
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <button className="button" type="button" onClick={onSavePrescription}>Salvar Prescrição</button>
            {/* Dica: adicionar botão "Exportar PDF" com jsPDF quando quiser */}
          </div>
        </FormField>

        <FormField label="Upload de exames/imagens">
          <input ref={inputRef} type="file" multiple onChange={e=>setFiles([...e.target.files])} />
          <div style={{marginTop:8}}><button className="button" type="button" onClick={onUploadFiles}>Enviar</button></div>
        </FormField>
      </div>

      <button className="button" style={{marginTop:12}}>Salvar Atendimento</button>
    </form>
  )
}
