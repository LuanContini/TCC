import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import RoutesConfig from './routes'
import { AuthProvider } from './context/AuthContext'

export default function App(){
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <div className="layout">
          <Sidebar />
          <main className="content">
            <RoutesConfig />
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
