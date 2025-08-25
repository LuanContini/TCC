import api from "./api";

export const listprofissionais = async (params) =>
  (await api.get("/profissionais", { params })).data;

export const getprofissionais = async (id) =>
  (await api.get(`/profissionais/${id}`)).data;

export const saveprofissionais = async (p) => {
  const { idProfissional, criadoEm, atualizadoEm, ...rest } = p;
  return idProfissional
    ? (await api.put(`/profissionais/${idProfissional}`, rest)).data
    : (await api.post("/profissionais", rest)).data;
};

