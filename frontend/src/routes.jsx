import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FaceID from './pages/ReconhecimentoFacial'

import PacientesList from './pages/Pacientes'
import PacienteForm from './pages/Pacientes/Form'
import PacienteView from './pages/Pacientes/View'

import ProfissionaisList from './pages/Profissionais'
import ProfissionalForm from './pages/Profissionais/Form'

import Agendamentos from './pages/Agendamentos'
import AgendamentoForm from './pages/Agendamentos/Form'

import Atendimento from './pages/Atendimento'
import Relatorios from './pages/Relatorios'

function PrivateRoute({ children }){
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function RoutesConfig(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/faceid" element={<PrivateRoute><FaceID /></PrivateRoute>} />

      <Route path="/pacientes" element={<PrivateRoute><PacientesList /></PrivateRoute>} />
      <Route path="/pacientes/novo" element={<PrivateRoute><PacienteForm /></PrivateRoute>} />
      <Route path="/pacientes/:id" element={<PrivateRoute><PacienteView /></PrivateRoute>} />
      <Route path="/pacientes/:id/editar" element={<PrivateRoute><PacienteForm /></PrivateRoute>} />

      <Route path="/profissionais" element={<PrivateRoute><ProfissionaisList /></PrivateRoute>} />
      <Route path="/profissionais/novo" element={<PrivateRoute><ProfissionalForm /></PrivateRoute>} />
      <Route path="/profissionais/:id/editar" element={<PrivateRoute><ProfissionalForm /></PrivateRoute>} />

      <Route path="/agendamentos" element={<PrivateRoute><Agendamentos /></PrivateRoute>} />
      <Route path="/agendamentos/novo" element={<PrivateRoute><AgendamentoForm /></PrivateRoute>} />

      <Route path="/atendimento" element={<PrivateRoute><Atendimento /></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
