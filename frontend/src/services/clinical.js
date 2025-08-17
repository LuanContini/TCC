import api from './api'

export const getHistory      = async (patientId) => (await api.get(`/clinical/history/${patientId}`)).data
export const saveEncounter   = async (payload)   => (await api.post('/clinical/encounter', payload)).data
export const savePrescription= async (payload)   => (await api.post('/clinical/prescription', payload)).data
export const uploadExam      = async (patientId, file) => {
  const form = new FormData()
  form.append('file', file)
  return (await api.post(`/clinical/${patientId}/upload`, form)).data
}
