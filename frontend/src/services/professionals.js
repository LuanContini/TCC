import api from './api'

export const listProfessionals = async (params) => (await api.get('/professionals', { params })).data
export const getProfessional   = async (id) => (await api.get(`/professionals/${id}`)).data
export const saveProfessional  = async (p) => {
  const { id, ...rest } = p
  return id ? (await api.put(`/professionals/${id}`, rest)).data : (await api.post('/professionals', rest)).data
}
