import axios from 'axios'

// Use different URLs for development vs production
const API_BASE_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.PROD 
    ? 'https://flash-deal-backend.onrender.com/api' 
    : 'http://localhost:5000/api')

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — scraping takes time
});

API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
);

export const searchProducts = async (query) => {
  console.log('🔍 API call with query:', query)
  
  try {
    const response = await API.post('/search', { query })
    console.log('📦 Full response:', response)
    console.log('📦 Response data:', response.data)
    
    // ✅ DIRECT RETURN - backend sends data directly
    const data = response.data
    console.log('📦 Processed data:', data)
    
    // Validate response
    if (!data) {
      throw new Error('No data received from server')
    }
    
    if (!data.results) {
      console.warn('⚠️ No results field in response:', data)
      return { ...data, results: [] }
    }
    
    return data
    
  } catch (error) {
    console.error('❌ API Error:', error)
    if (error.response) {
      console.error('❌ Response data:', error.response.data)
      console.error('❌ Response status:', error.response.status)
    }
    throw error
  }
}

export const getHistory = async () => {
  const { data } = await API.get('/search/history')
  return data
}

export const clearHistory = async () => {
  const { data } = await API.delete('/search/history')
  return data
}

export const deleteHistoryItem = async (id) => {
  const { data } = await API.delete(`/search/history/${id}`)
  return data
}