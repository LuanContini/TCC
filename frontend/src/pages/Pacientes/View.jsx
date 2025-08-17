import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatient } from '../../services/patients'

export default function PacienteView(){
  const { id } = useParams()
  const nav = useNavigate()
  const [p, setP] = useState(null)
  useEffect(()=>{ getPatient(id).then(setP) },[id])
  if(!p) return <p>Carregando...</p>
  return (
    <div className="card">
      <h2>{p.name}</h2>
      <p><strong>CPF:</strong> {p.cpf}</p>
      <p><strong>Nascimento:</strong> {p.birthDate}</p>
      <p><strong>Contato:</strong> {p.phone} • {p.email}</p>
      <p><strong>Endereço:</strong> {p.address}</p>
      <p><strong>Convênio:</strong> {p.healthPlan} • <strong>Carteirinha:</strong> {p.healthCard}</p>
      <p><strong>Responsável:</strong> {p.legalGuardian}</p>
      <p><strong>Sangue:</strong> {p.bloodType} • <strong>Alergias:</strong> {p.allergies}</p>
      <p><strong>Pré-existentes:</strong> {p.preexisting}</p>
      <p><strong>Observações:</strong> {p.notes}</p>
      <button className="button" onClick={()=>nav(`/pacientes/${id}/editar`)} style={{marginTop:12}}>Editar</button>
    </div>
  )
}
