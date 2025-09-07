// src/services/agendamentos.js
import api from "./api"

export const listAgendamentos = async () =>
  (await api.get("/agendamentos")).data

export const getAgendamentos = async (id) =>
  (await api.get(`/agendamentos/${id}`)).data

export const saveAgendamento = async (payload) =>
  (await api.post("/agendamentos", payload)).data

export const updateAgendamento = async (id, payload) =>
  (await api.put(`/agendamentos/${id}`, payload)).data

export const deleteAgendamento = async (id) =>
  (await api.delete(`/agendamentos/${id}`)).data
