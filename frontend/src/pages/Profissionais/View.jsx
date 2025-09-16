// src/pages/Profissionais/ProfissionalView.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfissionais, toggleDisponibilidade, toggleStatus } from '../../services/profissionais'

export default function ProfissionalView(){
  const { id } = useParams()
  const nav = useNavigate()
  const [profissional, setProfissional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadProfissional()
  }, [id])

  const loadProfissional = async () => {
    try {
      setLoading(true)
      const data = await getProfissionais(id)
      setProfissional(data)
    } catch (err) {
      setError('Erro ao carregar dados do profissional')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDisponibilidade = async () => {
    if (!profissional || updating) return;
    
    try {
      setUpdating(true)
      const dadosAtualizados = await toggleDisponibilidade(id)
      setProfissional(dadosAtualizados)
      
      // Feedback visual
      alert(`Disponibilidade alterada para: ${dadosAtualizados.disponibilidade ? 'Disponível' : 'Indisponível'}`)
    } catch (err) {
      setError('Erro ao alterar disponibilidade')
      console.error('Erro:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!profissional || updating) return;
    
    const confirmacao = window.confirm(
      `Tem certeza que deseja ${profissional.status === 'A' ? 'inativar' : 'reativar'} este profissional?`
    )
    
    if (!confirmacao) return;
    
    try {
      setUpdating(true)
      const dadosAtualizados = await toggleStatus(id)
      setProfissional(dadosAtualizados)
      
      // Feedback visual
      alert(`Status alterado para: ${dadosAtualizados.status === 'A' ? 'Ativo' : 'Inativo'}`)
    } catch (err) {
      setError('Erro ao alterar status')
      console.error('Erro:', err)
    } finally {
      setUpdating(false)
    }
  }

  const formatarCPF = (cpf) => {
    if (!cpf) return ''
    return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`
  }

  const formatarTelefone = (telefone) => {
    if (!telefone) return ''
    return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`
  }

  const formatarCEP = (cep) => {
    if (!cep) return ''
    return `${cep.substring(0, 5)}-${cep.substring(5)}`
  }

  const formatarData = (data) => {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return ''
    const nascimento = new Date(dataNasc)
    const hoje = new Date()
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return `${idade} anos`
  }

  const formatarConselho = (profissional) => {
    if (!profissional) return ''
    return `${profissional.tipoConc} ${profissional.codiConc}/${profissional.codiConc_UF}`
  }

  const getTipoConselho = (tipoConc) => {
    const tipos = {
      'CRM': 'Médico',
      'COREN': 'Enfermeiro',
      'CRP': 'Psicólogo',
      'CRO': 'Dentista',
      'CRF': 'Farmacêutico'
    }
    return tipos[tipoConc] || tipoConc
  }

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando dados do profissional...</p>
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
          <button className="button" onClick={loadProfissional}>
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!profissional) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Profissional não encontrado</p>
          <button className="button" onClick={() => nav('/profissionais')}>
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
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{profissional.nomeComp}</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>
            ID: {profissional.idProfissional} • 
            <span style={{ 
              backgroundColor: profissional.status === 'A' ? '#d4edda' : '#f8d7da',
              color: profissional.status === 'A' ? '#155724' : '#721c24',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              fontSize: '0.9rem'
            }}>
              {profissional.status === 'A' ? 'Ativo' : 'Inativo'}
            </span>
            {profissional.disponibilidade && (
              <span style={{ 
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                fontSize: '0.9rem'
              }}>
                Disponível
              </span>
            )}
          </p>
        </div>
        <div>
          <button 
            className="button secondary" 
            onClick={() => nav('/profissionais')}
            style={{ marginRight: '0.5rem' }}
            disabled={updating}
          >
            Voltar
          </button>
          <button 
            className="button primary" 
            onClick={() => nav(`/profissionais/${id}/editar`)}
            disabled={updating}
          >
            Editar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Coluna 1: Dados Pessoais */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Dados Pessoais
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>CPF:</strong> {formatarCPF(profissional.cpf)}
            </div>
            <div>
              <strong>RG:</strong> {profissional.rg || 'Não informado'}
            </div>
            <div>
              <strong>Data de Nascimento:</strong> {formatarData(profissional.dataNasc)} ({calcularIdade(profissional.dataNasc)})
            </div>
            <div>
              <strong>Sexo:</strong> {profissional.sexo === 'M' ? 'Masculino' : profissional.sexo === 'F' ? 'Feminino' : 'Outro'}
            </div>
          </div>
        </div>

        {/* Coluna 2: Contato */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Contato
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Telefone:</strong> {formatarTelefone(profissional.telefone)}
            </div>
            <div>
              <strong>E-mail:</strong> 
              <a href={`mailto:${profissional.email}`} style={{ color: '#3498db', marginLeft: '0.5rem' }}>
                {profissional.email}
              </a>
            </div>
            <div>
              <strong>Disponibilidade:</strong> 
              <span style={{ 
                backgroundColor: profissional.disponibilidade ? '#e8f5e8' : '#fff3cd',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                fontWeight: 'bold'
              }}>
                {profissional.disponibilidade ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 3: Endereço */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Endereço
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Logradouro:</strong> {profissional.logradouro}
            </div>
            <div>
              <strong>Número:</strong> {profissional.numero}
            </div>
            <div>
              <strong>Complemento:</strong> {profissional.complemento || 'Não informado'}
            </div>
            <div>
              <strong>Bairro:</strong> {profissional.bairro}
            </div>
            <div>
              <strong>Cidade:</strong> {profissional.cidade || 'Não informada'}
            </div>
            <div>
              <strong>Estado:</strong> {profissional.estado}
            </div>
            <div>
              <strong>CEP:</strong> {formatarCEP(profissional.cep)}
            </div>
            <div>
              <strong>País:</strong> {profissional.codiPais}
            </div>
          </div>
        </div>

        {/* Coluna 4: Dados Profissionais */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Dados Profissionais
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Registro Profissional:</strong>
              <div style={{ 
                backgroundColor: '#e3f2fd',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
                fontWeight: 'bold'
              }}>
                {formatarConselho(profissional)}
              </div>
            </div>
            <div>
              <strong>Categoria:</strong> 
              <span style={{ 
                backgroundColor: '#fff3cd',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem'
              }}>
                {getTipoConselho(profissional.tipoConc)}
              </span>
            </div>
            <div>
              <strong>Status Profissional:</strong>
              <span style={{ 
                backgroundColor: profissional.status === 'A' ? '#d4edda' : '#f8d7da',
                color: profissional.status === 'A' ? '#155724' : '#721c24',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                fontWeight: 'bold'
              }}>
                {profissional.status === 'A' ? 'Ativo' : 'Inativo'}
              </span>
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
            <strong>Cadastrado em:</strong> {new Date(profissional.criadoEm).toLocaleString('pt-BR')}
          </div>
          <div>
            <strong>Última atualização:</strong> {new Date(profissional.atualizadoEm).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Ações Adicionais */}
      <div style={{ 
        marginTop: '2rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid #ddd'
      }}>
        <h3 style={{ color: '#3498db', marginBottom: '1rem' }}>Ações</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="button info"
            onClick={() => nav(`/agendamentos?profissional=${id}`)}
            disabled={updating}
          >
            Ver Agendamentos
          </button>
          <button 
            className="button warning"
            onClick={handleToggleDisponibilidade}
            disabled={updating}
          >
            {updating ? 'Processando...' : 
             profissional.disponibilidade ? 'Marcar como Indisponível' : 'Marcar como Disponível'}
          </button>
          <button 
            className="button danger"
            onClick={handleToggleStatus}
            disabled={updating}
          >
            {updating ? 'Processando...' : 
             profissional.status === 'A' ? 'Inativar' : 'Reativar'}
          </button>
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