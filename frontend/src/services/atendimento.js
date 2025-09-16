// services/atendimento.js
import api from "./api"

export const listAtendimentos = async () => {
  try {
    const response = await api.get("/atendimentos")
    return response.data
  } catch (error) {
    console.error("Erro ao listar atendimentos:", error)
    throw error
  }
}

export const getAtendimento = async (id) => {
  try {
    const response = await api.get(`/atendimentos/${id}`)
    return response.data
  } catch (error) {
    console.error("Erro ao buscar atendimento:", error)
    throw error
  }
}

export const saveAtendimento = async (payload) => {
  try {
    console.log("Enviando payload para /atendimentos:", payload)
    
    const response = await api.post("/atendimentos", payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log("Resposta do servidor:", response.data)
    return response.data
    
  } catch (error) {
    console.error("Erro detalhado ao salvar atendimento:")
    console.error("Status:", error.response?.status)
    console.error("Dados:", error.response?.data)
    console.error("Mensagem:", error.message)
    
    // Repassa o erro completo para o formulário
    throw error
  }
}

export const updateAtendimento = async (id, payload) => {
  try {
    const response = await api.put(`/atendimentos/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error)
    throw error
  }
}

export const deleteAtendimento = async (id) => {
  try {
    const response = await api.delete(`/atendimentos/${id}`)
    return response.data
  } catch (error) {
    console.error("Erro ao deletar atendimento:", error)
    throw error
  }
}