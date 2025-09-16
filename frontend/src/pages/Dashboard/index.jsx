// src/pages/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { listPacientes } from '../../services/pacientes'
import { listProfissionais } from '../../services/profissionais'
import { listAgendamentos } from '../../services/agendamentos'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const [pacientes, setPacientes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [pacientesData, profissionaisData, agendamentosData] = await Promise.all([
          listPacientes(),
          listProfissionais(),
          listAgendamentos()
        ])
        
        setPacientes(pacientesData)
        setProfissionais(profissionaisData)
        setAgendamentos(agendamentosData)
      } catch (err) {
        setError('Erro ao carregar dados do dashboard')
        console.error('Erro:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Estatísticas calculadas
  const pacientesAtivos = pacientes.filter(p => p.status === 'A').length
  const profissionaisAtivos = profissionais.filter(p => p.status === 'A').length
  
  const agendamentosHoje = agendamentos.filter(a => {
    const hoje = new Date().toDateString()
    return new Date(a.horario).toDateString() === hoje
  }).length

  // Calcular agendamentos marcados vs realizados localmente
  const agendamentosMarcados = agendamentos.length
  const agendamentosRealizados = agendamentos.filter(a => a.status === 'CP').length

  // Calcular top especialidades localmente
  const topSpecialties = profissionais.reduce((acc, profissional) => {
    const count = agendamentos.filter(a => a.idProfissional === profissional.idProfissional).length
    if (count > 0) {
      acc.push({
        specialty: profissional.tipoConc,
        count: count
      })
    }
    return acc
  }, []).sort((a, b) => b.count - a.count).slice(0, 5)

  const agendamentosPorStatus = agendamentos.reduce((acc, agendamento) => {
    acc[agendamento.status] = (acc[agendamento.status] || 0) + 1
    return acc
  }, {})

  // Dados para gráfico de status
  const statusData = [
    { name: 'Pendentes', value: agendamentosPorStatus['PE'] || 0, color: '#FF9800' },
    { name: 'Confirmados', value: agendamentosPorStatus['CN'] || 0, color: '#4CAF50' },
    { name: 'Concluídos', value: agendamentosPorStatus['CP'] || 0, color: '#2196F3' },
    { name: 'Cancelados', value: agendamentosPorStatus['CA'] || 0, color: '#F44336' },
    { name: 'Reagendados', value: agendamentosPorStatus['RE'] || 0, color: '#9C27B0' }
  ]

  // Dados para gráfico de marcados vs realizados
  const marcadosVsRealizadosData = [
    { name: 'Agendamentos', Marcados: agendamentosMarcados, Realizados: agendamentosRealizados }
  ]

  // Últimos 5 agendamentos
  const ultimosAgendamentos = [...agendamentos]
    .sort((a, b) => new Date(b.horario) - new Date(a.horario))
    .slice(0, 5)

  const formatarStatus = (status) => {
    const statusMap = {
      'PE': 'Pendente',
      'CN': 'Confirmado',
      'CP': 'Concluído',
      'CA': 'Cancelado',
      'RE': 'Reagendado'
    }
    return statusMap[status] || status
  }

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return ''
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const formatarTipoConselho = (tipo) => {
    const tipos = {
      'CRM': 'Médico',
      'COREN': 'Enfermeiro',
      'CRP': 'Psicólogo',
      'CRO': 'Dentista',
      'CRF': 'Farmacêutico'
    }
    return tipos[tipo] || tipo
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Dashboard</h1>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Carregando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Dashboard</h1>
        <div className="card">
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="button" onClick={() => window.location.reload()}>
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      
      {/* Cards de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Total de Pacientes</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3498db' }}>
            {pacientes.length}
          </div>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            {pacientesAtivos} ativos
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Total de Profissionais</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {profissionais.length}
          </div>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            {profissionaisAtivos} ativos
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Total de Agendamentos</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2ecc71' }}>
            {agendamentos.length}
          </div>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            {agendamentosHoje} hoje
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Taxa de Conclusão</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f39c12' }}>
            {agendamentos.length > 0 ? Math.round((agendamentosPorStatus['CP'] || 0) / agendamentos.length * 100) : 0}%
          </div>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            Agendamentos concluídos
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 30 }}>
        {/* Gráfico de Status de Agendamentos */}
        <div className="card">
          <h3>Status dos Agendamentos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Agendamentos Marcados vs Realizados */}
        <div className="card">
          <h3>Agendamentos Marcados vs Realizados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marcadosVsRealizadosData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Marcados" fill="#8884d8" />
              <Bar dataKey="Realizados" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Especialidades */}
        <div className="card">
          <h3>Top Especialidades</h3>
          {topSpecialties.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSpecialties}>
                <XAxis dataKey="specialty" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value} agendamentos`, formatarTipoConselho(props.payload.specialty)]} />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </div>

      {/* Últimos Agendamentos */}
      <div className="card">
        <h3>Últimos Agendamentos</h3>
        {ultimosAgendamentos.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Código</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Paciente</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Profissional</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Data/Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ultimosAgendamentos.map(agendamento => (
                  <tr key={agendamento.idAgendamento} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{agendamento.codiAgen}</td>
                    <td style={{ padding: '12px' }}>{agendamento.paciente_nome || `Paciente #${agendamento.idPaciente}`}</td>
                    <td style={{ padding: '12px' }}>{agendamento.profissional_nome || `Profissional #${agendamento.idProfissional}`}</td>
                    <td style={{ padding: '12px' }}>{formatarDataHora(agendamento.horario)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 
                          agendamento.status === 'PE' ? '#fff3e0' :
                          agendamento.status === 'CN' ? '#e8f5e8' :
                          agendamento.status === 'CP' ? '#e3f2fd' :
                          agendamento.status === 'CA' ? '#ffebee' : '#f3e5f5',
                        color:
                          agendamento.status === 'PE' ? '#ff9800' :
                          agendamento.status === 'CN' ? '#4caf50' :
                          agendamento.status === 'CP' ? '#2196f3' :
                          agendamento.status === 'CA' ? '#f44336' : '#9c27b0'
                      }}>
                        {formatarStatus(agendamento.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum agendamento encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}