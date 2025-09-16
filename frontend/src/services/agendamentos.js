// src/services/agendamentos.js
import api from "./api";

export const listAgendamentos = async () => {
  try {
    const response = await api.get("/agendamentos");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    throw error;
  }
};

export const getAgendamento = async (id) => {
  try {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    throw error;
  }
};

export const saveAgendamento = async (payload) => {
  try {
    const response = await api.post("/agendamentos", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    throw error;
  }
};

export const updateAgendamento = async (id, payload) => {
  try {
    const response = await api.put(`/agendamentos/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw error;
  }
};

export const deleteAgendamento = async (id) => {
  try {
    const response = await api.delete(`/agendamentos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    throw error;
  }
};

export const confirmarAgendamento = async (id) => {
  try {
    const response = await api.put(`/agendamentos/${id}/confirmar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao confirmar agendamento:", error);
    throw error;
  }
};

export const cancelarAgendamento = async (id) => {
  try {
    const response = await api.put(`/agendamentos/${id}/cancelar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    throw error;
  }
};