import axios from 'axios'

// Ajuste a URL do seu backend aqui
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
