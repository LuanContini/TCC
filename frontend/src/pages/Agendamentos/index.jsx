import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable'
import { listSchedules } from '../../services/schedules'
import { useNavigate } from 'react-router-dom'


export default function Agendamentos(){
  const [rows, setRows] = useState([])
  useEffect(()=>{ (async ()=>{ setRows(await listSchedules()) })() },[])
  const nav = useNavigate()


  const columns = [
    { key:'id', header:'ID' },
    { key:'date', header:'Data' },
    { key:'time', header:'Hora' },
    { key:'patientName', header:'Paciente' },
    { key:'professionalName', header:'Profissional' },
    { key:'type', header:'Tipo' },
    { key:'status', header:'Status' }
  ]

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
        <h2>Agendamentos</h2>
        <button className="button" onClick={()=>nav('/agendamentos/novo')}>Novo</button>
      </div>
      <DataTable columns={columns} data={rows} />
      <p style={{marginTop:12}}>Sugestão: adicionar visão de calendário (mês/semana/dia) depois.</p>
    </div>
  )
}
