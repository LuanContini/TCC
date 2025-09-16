import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setsenha] = useState("")
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    try {
      await login({ email, senha })
      nav("/") // redireciona após login
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="content" style={{ maxWidth: 360, margin: "64px auto" }}>
      <form className="card" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <label>
          Email
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            className="input"
            type="senha"
            value={senha}
            onChange={(e) => setsenha(e.target.value)}
          />
        </label>
        <button className="button" style={{ marginTop: 12 }}>
          Acessar
        </button>
      </form>
    </div>
  )
}
