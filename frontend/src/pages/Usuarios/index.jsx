import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import { listUsuarios, deleteUsuario } from '../../services/usuarios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UsuariosList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const data = await listUsuarios();
      const mapped = data.map(u => ({
        id: u.id,
        name: u.nome,
        email: u.email,
        role: u.role,
        active: true // Usuários sempre ativos no seu sistema atual
      }));
      setRows(mapped);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      return;
    }

    try {
      await deleteUsuario(id);
      alert('Usuário excluído com sucesso');
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Perfil',
      render: (v) => {
        const roles = {
          admin: 'Administrador',
          atendente: 'Atendente',
          medico: 'Médico'
        };
        return roles[v] || v;
      }
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="button small"
            onClick={() => nav(`/usuarios/${row.id}`)}
            title="Editar"
          >
            ✏️
          </button>
          {user.id !== row.id && (
            <button
              className="button small danger"
              onClick={() => handleDelete(row.id, row.name)}
              title="Excluir"
            >
              🗑️
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2>Usuários</h2>
        <button 
          className="button primary" 
          onClick={() => nav('/usuarios/novo')}
          disabled={loading}
        >
          Novo Usuário
        </button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Carregando usuários...
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={rows} 
          onRowClick={(r) => nav(`/usuarios/${r.id}`)}
        />
      )}
    </div>
  );
}