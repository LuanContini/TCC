// src/services/profissionais.js
import api from "./api";

export const listProfissionais = async (params) =>
  (await api.get("/profissionais", { params })).data;

export const getProfissionais = async (id) =>
  (await api.get(`/profissionais/${id}`)).data;

export const saveProfissionais = async (p) => {
  const { idProfissional, criadoEm, atualizadoEm, ...rest } = p;
  return idProfissional
    ? (await api.put(`/profissionais/${idProfissional}`, rest)).data
    : (await api.post("/profissionais", rest)).data;
};

// Nova função para alterar disponibilidade
export const toggleDisponibilidade = async (id) => {
  try {
    // Primeiro busca o profissional atual
    const profissional = await getProfissionais(id);
    
    // Inverte a disponibilidade
    const novaDisponibilidade = !profissional.disponibilidade;
    
    // Atualiza apenas o campo disponibilidade
    const response = await api.patch(`/profissionais/${id}`, {
      disponibilidade: novaDisponibilidade
    });
    
    return response.data;
  } catch (error) {
    console.error("Erro ao alterar disponibilidade:", error);
    throw error;
  }
};

// Nova função para alterar status (ativo/inativo)
export const toggleStatus = async (id) => {
  try {
    // Primeiro busca o profissional atual
    const profissional = await getProfissionais(id);
    
    // Inverte o status
    const novoStatus = profissional.status === 'A' ? 'I' : 'A';
    
    // Atualiza apenas o campo status
    const response = await api.patch(`/profissionais/${id}`, {
      status: novoStatus
    });
    
    return response.data;
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    throw error;
  }
};