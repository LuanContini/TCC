import api from './api'

export const listPatients = async (params) => (await api.get('/patients', { params })).data
export const getPatient  = async (id)    => (await api.get(`/patients/${id}`)).data
export const savePatient = async (p) => {
  const { id, ...rest } = p
  return id ? (await api.put(`/patients/${id}`, rest)).data : (await api.post('/patients', rest)).data
}
