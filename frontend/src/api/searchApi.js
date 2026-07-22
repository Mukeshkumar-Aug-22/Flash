import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// In development, Vite proxy handles /api requests.
// In production, set VITE_API_URL to your deployed backend URL, e.g. https://your-backend.onrender.com/api
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — scraping takes time
})

// POST /api/search — search by name or URL
export const searchProducts = async (query) => {
  const { data } = await API.post('/search', { query })
  return data
}

// GET /api/search/history
export const getHistory = async () => {
  const { data } = await API.get('/search/history')
  return data
}

// DELETE /api/search/history
export const clearHistory = async () => {
  const { data } = await API.delete('/search/history')
  return data
}

// DELETE /api/search/history/:id
export const deleteHistoryItem = async (id) => {
  const { data } = await API.delete(`/search/history/${id}`)
  return data
}