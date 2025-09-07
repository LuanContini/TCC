import api from "./api"

export const listAtendimentos = async () =>
  (await api.get("/atendimentos")).data

export const getAtendimento = async (id) =>
  (await api.get(`/atendimentos/${id}`)).data

export const saveAtendimento = async (payload) =>
  (await api.post("/atendimentos", payload)).data

export const updateAtendimento = async (id, payload) =>
  (await api.put(`/atendimentos/${id}`, payload)).data

export const deleteAtendimento = async (id) =>
  (await api.delete(`/atendimentos/${id}`)).data
