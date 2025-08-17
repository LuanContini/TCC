import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable'
import { listProfessionals } from '../../services/professionals'
import { useNavigate } from 'react-router-dom'

export default function ProfissionaisList(){
  const [rows, setRows] = useState([])
  const nav = useNavigate()

  useEffect(()=>{ (async ()=>{ setRows(await listProfessionals()) })() },[])

  const columns = [
    { key:'id', header:'ID' },
    { key:'name', header:'Nome' },
    { key:'cpf', header:'CPF' },
    { key:'reg', header:'CRM/COREN' },
    { key:'specialty', header:'Especialidade' },
    { key:'active', header:'Status', render:(v)=> v ? 'Ativo':'Inativo' }
  ]

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
        <h2>Profissionais</h2>
        <button className="button" onClick={()=>nav('/profissionais/novo')}>Novo</button>
      </div>
      <DataTable columns={columns} data={rows} onRowClick={(r)=>nav(`/profissionais/${r.id}/editar`)} />
    </div>
  )
}
