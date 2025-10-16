import api from "./api";

export const listUsuarios = async (params) =>
  (await api.get("/usuarios", { params })).data;

export const getUsuario = async (id) =>
  (await api.get(`/usuarios/${id}`)).data;

export const saveUsuario = async (usuario) => {
  const { id, ...rest } = usuario;
  return id
    ? (await api.put(`/usuarios/${id}`, rest)).data
    : (await api.post("/usuarios/registrar", rest)).data;
};

export const deleteUsuario = async (id) =>
  (await api.delete(`/usuarios/${id}`)).data;

export const alterarSenha = async (id, dados) =>
  (await api.put(`/usuarios/${id}/alterar-senha`, dados)).data;

export const getPerfil = async () =>
  (await api.get("/usuarios/perfil")).data;