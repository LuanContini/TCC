import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable'
import { listPacientes } from '../../services/pacientes'
import { useNavigate } from 'react-router-dom'

export default function PacientesList(){
  const [rows, setRows] = useState([])
  const nav = useNavigate()

  useEffect(()=>{ (async ()=>{ setRows(await listPacientes()) })() },[])

  const columns = [
    { key:'id', header:'ID' },
    { key:'name', header:'Nome' },
    { key:'cpf', header:'CPF' },
    { key:'birthDate', header:'Nascimento' },
    { key:'healthPlan', header:'Convênio' }
  ]

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
        <h2>Pacientes</h2>
        <button className="button" onClick={()=>nav('/pacientes/novo')}>Novo Paciente</button>
      </div>
      <DataTable columns={columns} data={rows} onRowClick={(r)=>nav(`/pacientes/${r.id}`)} />
    </div>
  )
}
