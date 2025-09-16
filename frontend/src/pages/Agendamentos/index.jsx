import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable'
import { listAgendamentos } from '../../services/agendamentos'
import { useNavigate } from 'react-router-dom'

export default function AgendamentosList() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    loadAgendamentos()
  }, [])

  const loadAgendamentos = async () => {
    try {
      setLoading(true)
      const agendamentos = await listAgendamentos()
            
      const processedData = agendamentos.map(agendamento => {
        return {
          ...agendamento,
          uniqueId: agendamento.idAgendamento || `agendamento-${Math.random().toString(36).substr(2, 9)}`,
          pacienteNome: agendamento.paciente_nome || `Paciente #${agendamento.idPaciente}`,
          profissionalNome: agendamento.profissional_nome || `Profissional #${agendamento.idProfissional}`,
          atendimentoDescricao: agendamento.atendimento_tipo || `Atendimento #${agendamento.idAtendimento}`
        };
      });
      
      setRows(processedData)
    } catch (err) {
      setError('Erro ao carregar agendamentos')
      console.error('Erro detalhado ao carregar agendamentos:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatStatus = (status) => {
    const statusMap = {
      'PE': 'Pendente',
      'CN': 'Confirmado',
      'CP': 'Concluído',
      'CA': 'Cancelado',
      'RE': 'Reagendado'
    }
    return statusMap[status] || status
  }

  const formatCanal = (canal) => {
    const canalMap = {
      'W': 'WhatsApp',
      'T': 'Telefone',
      'O': 'Online',
      'P': 'Presencial'
    }
    return canalMap[canal] || canal
  }

  const getStatusClass = (status) => {
    const classMap = {
      'PE': 'status-pe',
      'CN': 'status-cn',
      'CP': 'status-cp',
      'CA': 'status-ca',
      'RE': 'status-re'
    }
    return classMap[status] || ''
  }

  const formatTipoAtendimento = (tipo) => {
    const tipoMap = {
      'CON': 'Consulta',
      'EXA': 'Exame',
      'RET': 'Retorno',
      'URG': 'Urgência'
    }
    return tipoMap[tipo] || tipo
  }

  const columns = [
    { key: 'idAgendamento', header: 'ID', width: 60 },
    { key: 'codiAgen', header: 'Código', width: 80 },
    { 
      key: 'horario', 
      header: 'Data/Hora', 
      render: (value) => value ? new Date(value).toLocaleString('pt-BR') : 'N/A',
      width: 150
    },
    { 
      key: 'pacienteNome', 
      header: 'Paciente',
    },
    { 
      key: 'profissionalNome', 
      header: 'Profissional',
    },
    { 
      key: 'atendimento_tipo', 
      header: 'Tipo Atendimento',
      render: (value) => formatTipoAtendimento(value),
      width: 120
    },
    { 
      key: 'canalAgen', 
      header: 'Canal',
      render: (value) => formatCanal(value),
      width: 100
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={getStatusClass(value)}>
          {formatStatus(value)}
        </span>
      ),
      width: 120
    },
    { 
      key: 'criadoEm', 
      header: 'Criado em',
      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : 'N/A',
      width: 100
    }
  ]

  if (loading) {
    return <div className="card">Carregando agendamentos...</div>
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>
        <button className="button" onClick={loadAgendamentos}>Tentar Novamente</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2>Agendamentos</h2>
        <button className="button primary" onClick={() => nav('/agendamentos/novo')}>
          + Novo Agendamento
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={rows} 
        onRowClick={(r) => nav(`/agendamentos/${r.idAgendamento}`)}
        emptyMessage="Nenhum agendamento encontrado"
      />
    </div>
  )
}