import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkStyle = ({isActive}) => ({
  display: 'block', 
  padding: '8px 10px', 
  borderRadius: 8, 
  textDecoration: 'none',
  background: isActive ? '#111827' : 'transparent', 
  color: isActive ? '#fff' : '#111827',
  transition: 'all 0.2s ease',
  marginBottom: '4px'
})

export default function Sidebar(){
  const { user, isAuthenticated, hasAnyRole } = useAuth()

  // Se não estiver autenticado, não mostra o sidebar
  if (!isAuthenticated()) {
    return null;
  }

  // Mapeamento de itens do menu com suas permissões
  const menuItems = [
    { path: '/', label: 'Dashboard', roles: ['admin', 'atendente', 'medico'] },
    { path: '/faceid', label: 'Reconhecimento Facial', roles: ['admin', 'atendente', 'medico'] },
    { path: '/pacientes', label: 'Pacientes', roles: ['admin', 'atendente', 'medico'] },
    { path: '/profissionais', label: 'Profissionais', roles: ['admin', 'atendente'] },
    { path: '/agendamentos', label: 'Agendamentos', roles: ['admin', 'atendente', 'medico'] },
    { path: '/atendimento', label: 'Atendimento', roles: ['admin', 'atendente', 'medico'] },
    { path: '/relatorios', label: 'Relatórios', roles: ['admin'] },
    { path: '/usuarios', label: 'Usuários', roles: ['admin'] }
  ];

  return (
    <aside className="sidebar">
      <nav>
        {menuItems.map((item) => (
          hasAnyRole(item.roles) && (
            <NavLink 
              key={item.path}
              to={item.path} 
              style={linkStyle}
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          )
        ))}
        
        {/* Informações do usuário logado */}
        {user && (
          <>
            <hr style={{ margin: '12px 0', borderColor: '#e5e7eb' }}/>
            <div style={{ 
              padding: '8px 10px', 
              color: '#6b7280', 
              fontSize: '0.875rem'
            }}>
              <div style={{ fontWeight: 'bold', color: '#111827' }}>
                {user.email}
              </div>
              <div style={{ textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}