import api from './api'

export const listSchedules = async (params) => (await api.get('/appointments', { params })).data
export const saveSchedule  = async (s) => (await api.post('/appointments', s)).data
