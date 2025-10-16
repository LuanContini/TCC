import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import RoutesConfig from './routes'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'

// Componente para o layout autenticado (com sidebar)
function AuthenticatedLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <div className="layout">
        <Sidebar />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

// Componente para o layout não autenticado (sem sidebar)
function UnauthenticatedLayout({ children }) {
  return (
    <div className="app">
      <main className="content" style={{ marginLeft: 0 }}>
        {children}
      </main>
    </div>
  )
}

// Componente principal que decide qual layout usar
function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <>
      {isAuthenticated() ? (
        <AuthenticatedLayout>
          <RoutesConfig />
        </AuthenticatedLayout>
      ) : (
        <UnauthenticatedLayout>
          <RoutesConfig />
        </UnauthenticatedLayout>
      )}
    </>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}