import api from "./api";

// Listar todos os pacientes
export const listPacientes = async (params) =>
  (await api.get("/pacientes", { params })).data;

// Buscar paciente por ID
export const getPaciente = async (id) =>
  (await api.get(`/pacientes/${id}`)).data;

// Salvar paciente (novo ou editar) com suporte a foto
export const savePaciente = async (formData, id = null) => {
  const config = {
    headers: { 
      "Content-Type": "multipart/form-data",
    },
  };

  if (id) {
    return (await api.put(`/pacientes/${id}`, formData, config)).data;
  } else {
    // Criar novo paciente
    return (await api.post("/pacientes", formData, config)).data;
  }
};