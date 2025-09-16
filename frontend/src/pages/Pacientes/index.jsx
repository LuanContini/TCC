import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable'
import { listPacientes } from '../../services/pacientes'
import { useNavigate } from 'react-router-dom'

export default function PacientesList(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    loadPacientes()
  }, [])

  const loadPacientes = async () => {
    try {
      setLoading(true)
      const pacientes = await listPacientes()
      setRows(pacientes)
    } catch (err) {
      setError('Erro ao carregar pacientes')
      console.error('Erro ao carregar pacientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'idPaciente', header: 'ID' },
    { key: 'nomeComp', header: 'Nome Completo' },
    { key: 'cpf', header: 'CPF', 
      render: (value) => value ? `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}` : ''
    },
    { key: 'dataNasc', header: 'Data Nascimento', 
      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : ''
    },
    { key: 'telefone', header: 'Telefone',
      render: (value) => value ? `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}` : ''
    },
    { key: 'status', header: 'Status',
      render: (value) => value === 'A' ? 'Ativo' : 'Inativo'
    }
  ]

  if (loading) {
    return <div className="card">Carregando pacientes...</div>
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>
        <button className="button" onClick={loadPacientes}>Tentar Novamente</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2>Pacientes Cadastrados</h2>
        <button className="button primary" onClick={() => nav('/pacientes/novo')}>
          + Novo Paciente
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={rows} 
        onRowClick={(r) => nav(`/pacientes/${r.idPaciente}`)}
        emptyMessage="Nenhum paciente cadastrado"
      />
    </div>
  )
}