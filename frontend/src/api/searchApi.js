import axios from 'axios'

// Base URL — uses Vite proxy in dev, so no need for full URL
const API = axios.create({
  baseURL: '/api',
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