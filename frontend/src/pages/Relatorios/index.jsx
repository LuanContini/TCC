import React, { useState } from 'react'
import { reportByProAndPeriod, reportScheduledVsDone, reportTopSpecialties, reportFinancial } from '../../services/reports'
import DataTable from '../../components/DataTable'

export default function Relatorios(){
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState([])

  async function run(type){
    let data
    if(type==='pro-period'){
      data = await reportByProAndPeriod(from, to, professionalId)
    }else if(type==='svsd'){
      data = await reportScheduledVsDone(from, to)
    }else if(type==='top-spec'){
      data = await reportTopSpecialties(from, to)
    }else if(type==='financial'){
      data = await reportFinancial(from, to)
    }
    if(Array.isArray(data) && data.length){
      setColumns(Object.keys(data[0]).map(k => ({ key:k, header:k })))
      setRows(data)
    }else{
      setColumns([]); setRows([])
      alert('Sem dados para o filtro informado.')
    }
  }

  return (
    <div>
      <h2>Relatórios & Indicadores</h2>
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
          <label>De<input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
          <label>Até<input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
          <label>Profissional (ID)<input className="input" value={professionalId} onChange={e=>setProfessionalId(e.target.value)} /></label>
        </div>
        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button className="button" onClick={()=>run('pro-period')}>Atendimentos por Profissional</button>
          <button className="button" onClick={()=>run('svsd')}>Agendadas vs Realizadas</button>
          <button className="button" onClick={()=>run('top-spec')}>Ranking Especialidades</button>
          <button className="button" onClick={()=>run('financial')}>Financeiro</button>
        </div>
      </div>
      {columns.length ? <DataTable columns={columns} data={rows} /> : <p>Escolha um relatório e execute.</p>}
    </div>
  )
}
