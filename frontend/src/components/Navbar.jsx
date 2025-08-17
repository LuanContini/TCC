import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <header className="navbar">
      <strong>Hospital • Reconhecimento Facial</strong>
      <div style={{marginLeft:'auto'}}>
        {user && (
          <>
            <span style={{marginRight:12}}>Olá, {user.name}</span>
            <button className="button" onClick={logout}>Sair</button>
          </>
        )}
      </div>
    </header>
  )
}
