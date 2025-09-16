// src/pages/Agendamentos/AgendamentoView.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAgendamento, cancelarAgendamento } from '../../services/agendamentos'

export default function AgendamentoView(){
  const { id } = useParams()
  const nav = useNavigate()
  const [agendamento, setAgendamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAgendamento()
  }, [id])

  const loadAgendamento = async () => {
    try {
      setLoading(true)
      const data = await getAgendamento(id)
      setAgendamento(data)
    } catch (err) {
      setError('Erro ao carregar dados do agendamento')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return ''
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const formatarData = (data) => {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

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

  const formatarCanal = (canal) => {
    const canalMap = {
      'W': 'WhatsApp',
      'T': 'Telefone',
      'O': 'Online',
      'P': 'Presencial'
    }
    return canalMap[canal] || canal
  }

  const formatarTipoAtendimento = (tipo) => {
    const tipoMap = {
      'CON': 'Consulta',
      'EXA': 'Exame',
      'RET': 'Retorno',
      'URG': 'Urgência'
    }
    return tipoMap[tipo] || tipo
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

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando dados do agendamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="button" onClick={loadAgendamento}>
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!agendamento) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Agendamento não encontrado</p>
          <button className="button" onClick={() => nav('/agendamentos')}>
            Voltar para a lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Agendamento #{agendamento.codiAgen}</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>
            ID: {agendamento.idAgendamento} • 
            <span className={getStatusClass(agendamento.status)} style={{ 
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              fontSize: '0.9rem'
            }}>
              {formatarStatus(agendamento.status)}
            </span>
          </p>
        </div>
        <div>
          <button 
            className="button secondary" 
            onClick={() => nav('/agendamentos')}
            style={{ marginRight: '0.5rem' }}
          >
            Voltar
          </button>
          <button 
            className="button primary" 
            onClick={() => nav(`/agendamentos/${id}/editar`)}
          >
            Editar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Coluna 1: Informações do Agendamento */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Informações do Agendamento
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Código:</strong> {agendamento.codiAgen}
            </div>
            <div>
              <strong>Data e Hora:</strong> {formatarDataHora(agendamento.horario)}
            </div>
            <div>
              <strong>Canal:</strong> {formatarCanal(agendamento.canalAgen)}
            </div>
            <div>
              <strong>Tipo de Atendimento:</strong> 
              <span style={{ 
                backgroundColor: '#e3f2fd',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                fontWeight: 'bold'
              }}>
                {formatarTipoAtendimento(agendamento.atendimento_tipo)}
              </span>
            </div>
            <div>
              <strong>Status:</strong>
              <span className={getStatusClass(agendamento.status)} style={{ 
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                fontWeight: 'bold'
              }}>
                {formatarStatus(agendamento.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Dados do Paciente */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Dados do Paciente
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Nome:</strong> 
              <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
                {agendamento.paciente_nome}
              </span>
            </div>
            <div>
              <strong>ID do Paciente:</strong> {agendamento.idPaciente}
            </div>
            <div>
              <button 
                className="button small"
                onClick={() => nav(`/pacientes/${agendamento.idPaciente}`)}
                style={{ marginTop: '0.5rem' }}
              >
                Ver perfil completo
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 3: Dados do Profissional */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Dados do Profissional
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Nome:</strong> 
              <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
                {agendamento.profissional_nome}
              </span>
            </div>
            <div>
              <strong>ID do Profissional:</strong> {agendamento.idProfissional}
            </div>
            <div>
              <button 
                className="button small"
                onClick={() => nav(`/profissionais/${agendamento.idProfissional}`)}
                style={{ marginTop: '0.5rem' }}
              >
                Ver perfil completo
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 4: Ações e Informações Adicionais */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Ações
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {agendamento.status === 'PE' && (
              <>
                <button 
                  className="button success"
                  onClick={() => {
                    // Implementar confirmação do agendamento
                    console.log('Confirmar agendamento:', agendamento.idAgendamento)
                  }}
                >
                  Confirmar Agendamento
                </button>
                <button 
                  className="button warning"
                  onClick={() => {
                    cancelarAgendamento(idAgendamento)
                  }}
                >
                  Reagendar
                </button>
              </>
            )}
            
            {agendamento.status === 'CN' && (
              <button 
                className="button danger"
                onClick={() => {
                  // Implementar cancelamento
                  console.log('Cancelar agendamento:', agendamento.idAgendamento)
                }}
              >
                Cancelar Agendamento
              </button>
            )}

            {(agendamento.status === 'CP' || agendamento.status === 'CA') && (
              <div style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#6c757d' }}>
                  {agendamento.status === 'CP' 
                    ? 'Agendamento concluído' 
                    : 'Agendamento cancelado'}
                </p>
              </div>
            )}

            <div>
              <strong>ID do Atendimento:</strong> {agendamento.idAtendimento}
            </div>
          </div>
        </div>
      </div>

      {/* Datas de Criação e Atualização */}
      <div style={{ 
        marginTop: '2rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid #ddd',
        fontSize: '0.9rem',
        color: '#7f8c8d'
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong>Agendamento criado em:</strong> {formatarDataHora(agendamento.criadoEm)}
          </div>
          <div>
            <strong>Última atualização:</strong> {formatarDataHora(agendamento.atualizadoEm)}
          </div>
        </div>
      </div>

      {/* CSS inline para os status */}
      <style>
        {`
          .status-pe { color: #ff9800; background-color: #fff3e0; }
          .status-cn { color: #4caf50; background-color: #e8f5e8; }
          .status-cp { color: #2196f3; background-color: #e3f2fd; }
          .status-ca { color: #f44336; background-color: #ffebee; text-decoration: line-through; }
          .status-re { color: #9c27b0; background-color: #f3e5f5; }
        `}
      </style>
    </div>
  )
}