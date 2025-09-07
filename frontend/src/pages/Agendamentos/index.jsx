// src/pages/Agendamentos/AgendamentosList.jsx
import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable'
import { listAgendamentos } from '../../services/agendamentos'
import { useNavigate } from 'react-router-dom'

export default function AgendamentosList() {
  const [rows, setRows] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    (async () => {
      const data = await listAgendamentos()
      // garante que os dados venham já no formato esperado
      const mapped = data.map(a => ({
        id: a.id,                     // id agendamento
        data: a.data,                 // data
        hora: a.hora,                 // hora
        paciente_id: a.paciente_id,   // fk paciente
        profissional_id: a.profissional_id, // fk profissional
        tipo: a.tipo,
        status: a.status
      }))
      setRows(mapped)
    })()
  }, [])

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'data', header: 'Data' },
    { key: 'hora', header: 'Hora' },
    { key: 'paciente_id', header: 'Paciente' },
    { key: 'profissional_id', header: 'Profissional' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'status', header: 'Status' }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2>Agendamentos</h2>
        <button className="button" onClick={() => nav('/agendamentos/novo')}>
          Novo
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={rows} 
        onRowClick={(r)=>nav(`/agendamentos/${r.id}/editar`)} 
      />
    </div>
  )
}
