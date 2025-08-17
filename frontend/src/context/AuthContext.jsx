import React, { createContext, useContext, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  function login({ email }){ setUser({ id:1, name: email }) } // troque para login real/JWT
  function logout(){ setUser(null); localStorage.removeItem('token') }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
export function useAuth(){ return useContext(AuthCtx) }
