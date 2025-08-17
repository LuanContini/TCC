import React from 'react'
import { NavLink } from 'react-router-dom'

const linkStyle = ({isActive})=>({
  display:'block', padding:'8px 10px', borderRadius:8, textDecoration:'none',
  background: isActive ? '#111827' : 'transparent', color: isActive ? '#fff' : '#111827'
})

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/faceid" style={linkStyle}>Reconhecimento Facial</NavLink>
        <hr/>
        <NavLink to="/pacientes" style={linkStyle}>Pacientes</NavLink>
        <NavLink to="/profissionais" style={linkStyle}>Profissionais</NavLink>
        <NavLink to="/agendamentos" style={linkStyle}>Agendamentos</NavLink>
        <NavLink to="/atendimento" style={linkStyle}>Atendimento</NavLink>
        <NavLink to="/relatorios" style={linkStyle}>Relatórios</NavLink>
      </nav>
    </aside>
  )
}
