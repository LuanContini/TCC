import React, { createContext, useContext, useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar se o token é válido e não expirado
  const isTokenValid = (token) => {
    try {
      const decoded = jwt_decode.default(token);
      const currentTime = Date.now() / 1000; // tempo atual em segundos
      
      // Verifica se o token expirou
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn("Token expirado");
        return false;
      }
      
      // Verifica se tem os campos mínimos necessários
      if (!decoded.id || !decoded.role) {
        console.warn("Token inválido: faltam campos obrigatórios");
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      return false;
    }
  };

  // Reconstrói o usuário a partir do token no localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenValid(token)) {
      try {
        const decoded = jwt_decode.default(token);
        setUser({
          id: decoded.id,
          email: decoded.email || "",
          role: decoded.role,
          exp: decoded.exp, // guarda a expiração para verificação posterior
        });
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.removeItem("token");
      }
    } else if (token) {
      // Token existe mas é inválido - remove do storage
      console.warn("Token inválido ou expirado, removendo...");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  // Verifica periodicamente se o token está prestes a expirar
  useEffect(() => {
    if (!user?.exp) return;

    const checkTokenExpiration = () => {
      const currentTime = Date.now() / 1000;
      const timeUntilExpiration = user.exp - currentTime;
      
      // Avisa 5 minutos antes da expiração
      if (timeUntilExpiration > 0 && timeUntilExpiration < 300) {
        console.warn(`Token expirará em ${Math.round(timeUntilExpiration)} segundos`);
        // Você pode adicionar um alerta para o usuário aqui
      }
      
      // Se expirou, faz logout
      if (timeUntilExpiration <= 0) {
        console.warn("Token expirado, fazendo logout...");
        logout();
      }
    };

    // Verifica a cada minuto
    const interval = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration(); // Verifica imediatamente

    return () => clearInterval(interval);
  }, [user?.exp]);

  async function login({ email, senha }) {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Credenciais inválidas");
      }

      const data = await res.json();
      const token = data.token;

      if (!token) {
        throw new Error("Token não recebido do servidor");
      }

      // Verifica se o token recebido é válido
      if (!isTokenValid(token)) {
        throw new Error("Token inválido recebido do servidor");
      }

      localStorage.setItem("token", token);

      const decoded = jwt_decode.default(token);
      setUser({
        id: decoded.id,
        email: decoded.email || email,
        role: decoded.role,
        exp: decoded.exp,
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

  // Função para verificar se o usuário atual está autenticado
  const isAuthenticated = () => {
    if (!user) return false;
    
    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      logout();
      return false;
    }
    
    return true;
  };

  // Função para verificar roles específicas
  const hasRole = (requiredRole) => {
    if (!isAuthenticated()) return false;
    return user.role === requiredRole;
  };

  

  // Função para verificar múltiplas roles
  const hasAnyRole = (requiredRoles) => {
    if (!isAuthenticated()) return false;
    return requiredRoles.includes(user.role);
  };

  // Função para renovar o token (se necessário)
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Nenhum token disponível");
      
      const res = await fetch("http://localhost:5000/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (res.ok) {
        const data = await res.json();
        const newToken = data.token;
        
        if (newToken && isTokenValid(newToken)) {
          localStorage.setItem("token", newToken);
          const decoded = jwt_decode.default(newToken);
          setUser({
            id: decoded.id,
            email: decoded.email || user?.email,
            role: decoded.role,
            exp: decoded.exp,
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Erro ao renovar token:", err);
      return false;
    }
  };

  

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    refreshToken
  };

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;

  
}