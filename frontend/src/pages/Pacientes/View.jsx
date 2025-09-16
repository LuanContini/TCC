import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPaciente } from '../../services/pacientes'

export default function PacienteView(){
  const { id } = useParams()
  const nav = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPaciente()
  }, [id])

  const loadPaciente = async () => {
    try {
      setLoading(true)
      const data = await getPaciente(id)
      setPaciente(data)
    } catch (err) {
      setError('Erro ao carregar dados do paciente')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando dados do paciente...</p>
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
          <button className="button" onClick={loadPaciente}>
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Paciente não encontrado</p>
          <button className="button" onClick={() => nav('/pacientes')}>
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
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{paciente.nomeComp}</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>
            ID: {paciente.idPaciente} • 
            <span style={{ 
              backgroundColor: paciente.status === 'A' ? '#d4edda' : '#f8d7da',
              color: paciente.status === 'A' ? '#155724' : '#721c24',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              fontSize: '0.9rem'
            }}>
              {paciente.status === 'A' ? 'Ativo' : 'Inativo'}
            </span>
          </p>
        </div>
        <div>
          <button 
            className="button secondary" 
            onClick={() => nav('/pacientes')}
            style={{ marginRight: '0.5rem' }}
          >
            Voltar
          </button>
          <button 
            className="button primary" 
            onClick={() => nav(`/pacientes/${id}/editar`)}
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
              <strong>CPF:</strong> {formatarCPF(paciente.cpf)}
            </div>
            <div>
              <strong>RG:</strong> {paciente.rg || 'Não informado'}
            </div>
            <div>
              <strong>Data de Nascimento:</strong> {formatarData(paciente.dataNasc)} ({calcularIdade(paciente.dataNasc)})
            </div>
            <div>
              <strong>Sexo:</strong> {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Outro'}
            </div>
            <div>
              <strong>Tipo Sanguíneo:</strong> 
              <span style={{ 
                backgroundColor: paciente.tipoSangue ? '#e3f2fd' : 'transparent',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                fontWeight: 'bold'
              }}>
                {paciente.tipoSangue || 'Não informado'}
              </span>
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
              <strong>Telefone:</strong> {formatarTelefone(paciente.telefone)}
            </div>
            <div>
              <strong>E-mail:</strong> 
              <a href={`mailto:${paciente.email}`} style={{ color: '#3498db', marginLeft: '0.5rem' }}>
                {paciente.email}
              </a>
            </div>
            <div>
              <strong>Responsável Legal:</strong> {paciente.responsavel || 'Não informado'}
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
              <strong>Logradouro:</strong> {paciente.logradouro}
            </div>
            <div>
              <strong>Número:</strong> {paciente.numero}
            </div>
            <div>
              <strong>Complemento:</strong> {paciente.complemento || 'Não informado'}
            </div>
            <div>
              <strong>Bairro:</strong> {paciente.bairro}
            </div>
            <div>
              <strong>Cidade:</strong> {paciente.cidade || 'Não informada'}
            </div>
            <div>
              <strong>Estado:</strong> {paciente.estado}
            </div>
            <div>
              <strong>CEP:</strong> {formatarCEP(paciente.cep)}
            </div>
          </div>
        </div>

        {/* Coluna 4: Saúde */}
        <div>
          <h3 style={{ color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Informações de Saúde
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Alergias:</strong> 
              <div style={{ 
                backgroundColor: paciente.alergia ? '#fff3cd' : 'transparent',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                {paciente.alergia || 'Nenhuma alergia registrada'}
              </div>
            </div>
            <div>
              <strong>Doenças Pré-existentes:</strong>
              <div style={{ 
                backgroundColor: paciente.histDoencas ? '#ffe6e6' : 'transparent',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                {paciente.histDoencas || 'Nenhuma doença pré-existente registrada'}
              </div>
            </div>
            <div>
              <strong>Observações:</strong>
              <div style={{ 
                backgroundColor: paciente.observacao ? '#e3f2fd' : 'transparent',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                {paciente.observacao || 'Nenhuma observação adicional'}
              </div>
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
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <strong>Cadastrado em:</strong> {new Date(paciente.criadoEm).toLocaleString('pt-BR')}
          </div>
          <div>
            <strong>Última atualização:</strong> {new Date(paciente.atualizadoEm).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  )
}