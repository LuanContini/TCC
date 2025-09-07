import api from "./api";

export const listPacientes = async (params) =>
  (await api.get("/pacientes", { params })).data;
export const getPaciente = async (id) =>
  (await api.get(`/pacientes/${id}`)).data;
export const savePaciente = async (p) => {
  const { id, ...rest } = p;
  return id
    ? (await api.put(`/pacientes/${id}`, rest)).data
    : (await api.post("/pacientes", rest)).data;
};
