import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    // TODO: fazer POST /auth/login e salvar token
    login({ email })
    nav('/')
  }

  return (
    <div className="content" style={{maxWidth:360, margin:'64px auto'}}>
      <form className="card" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        <label>Email<input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Senha<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <button className="button" style={{marginTop:12}}>Acessar</button>
      </form>
    </div>
  )
}
