import React, { useEffect, useState } from 'react'
import { listPatients } from '../../services/patients'
import { listprofissionais } from '../../services/profissionais'
import { listSchedules } from '../../services/schedules'
import { reportScheduledVsDone, reportTopSpecialties } from '../../services/reports'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [profissionais, setprofissionais] = useState([])
  const [schedules, setSchedules] = useState([])
  const [reportSV, setReportSV] = useState(null)
  const [topSpecialties, setTopSpecialties] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, pr, s] = await Promise.all([
          listPatients(),
          listprofissionais(),
          listSchedules()
        ])
        setPatients(p)
        setprofissionais(pr)
        setSchedules(s)

        const [svReport, specialtiesReport] = await Promise.all([
          reportScheduledVsDone('2025-01-01', '2025-12-31'),
          reportTopSpecialties('2025-01-01', '2025-12-31')
        ])
        setReportSV(svReport)
        setTopSpecialties(specialtiesReport)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  // Últimos 5 agendamentos
  const lastSchedules = schedules.slice(-5).reverse()

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="card">
          <h2>Pacientes</h2>
          <p>Total: {patients.length}</p>
        </div>
        <div className="card">
          <h2>Profissionais</h2>
          <p>Total: {profissionais.length}</p>
        </div>
        <div className="card">
          <h2>Agendamentos</h2>
          <p>Total: {schedules.length}</p>
        </div>
        <div className="card">
          <h2>Agendamentos marcados x realizados</h2>
          {reportSV ? (
            <ResponsiveContainer width={300} height={200}>
              <BarChart data={[{ name: 'Agendamentos', Marcados: reportSV.marked, Realizados: reportSV.done }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Marcados" fill="#8884d8" />
                <Bar dataKey="Realizados" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p>Carregando...</p>}
        </div>
        <div className="card">
          <h2>Top Especialidades</h2>
          {topSpecialties.length ? (
            <ResponsiveContainer width={300} height={200}>
              <BarChart data={topSpecialties}>
                <XAxis dataKey="specialty" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p>Carregando...</p>}
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Últimos agendamentos</h2>
        {lastSchedules.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Profissional</th>
                <th>Data/Hora</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lastSchedules.map(s => (
                <tr key={s.idAgendamento}>
                  <td>{s.codiAgen}</td>
                  <td>{s.patientName || s.patientId}</td>
                  <td>{s.profissionaisName || s.profissionaisId}</td>
                  <td>{new Date(s.horario).toLocaleString()}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Sem agendamentos recentes</p>}
      </div>
    </div>
  )
}
