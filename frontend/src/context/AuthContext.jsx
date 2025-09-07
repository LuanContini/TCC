import React, { createContext, useContext, useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode"; // corrigido para funcionar com Vite

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // indica se ainda está reconstruindo o user

  // Reconstrói o usuário a partir do token no localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode.default(token);
        setUser({
          id: decoded.id,
          email: decoded.email || "",
          role: decoded.role,
        });
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false); // terminou de verificar o token
  }, []);

  async function login({ email, senha }) {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) throw new Error("Credenciais inválidas");

      const data = await res.json();
      const token = data.token;

      localStorage.setItem("token", token);

      const decoded = jwt_decode.default(token);
      setUser({
        id: decoded.id,
        email: decoded.email || email,
        role: decoded.role,
      });

      return true;
    } catch (err) {
      console.error("Erro no login:", err);
      throw err;
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
