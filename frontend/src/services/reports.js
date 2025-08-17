import api from './api'

export const reportByProAndPeriod = async (from, to, professionalId) =>
  (await api.get('/reports/attendance', { params:{ from, to, professionalId } })).data

export const reportScheduledVsDone = async (from, to) =>
  (await api.get('/reports/scheduled-vs-done', { params:{ from, to } })).data

export const reportTopSpecialties = async (from, to) =>
  (await api.get('/reports/top-specialties', { params:{ from, to } })).data

export const reportFinancial = async (from, to) =>
  (await api.get('/reports/financial', { params:{ from, to } })).data
