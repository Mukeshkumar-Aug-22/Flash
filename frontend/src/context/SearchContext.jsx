import { createContext, useContext, useState } from 'react'
import { searchProducts as apiSearch } from '../api/searchApi'
import toast from 'react-hot-toast'

const SearchContext = createContext()

export const SearchProvider = ({ children }) => {
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [searchInfo, setSearchInfo] = useState(null)
  const [currentQuery, setCurrentQuery] = useState('')

  const search = async (query) => {
    if (!query.trim()) {
      toast.error('Please enter a product name or URL')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])
    setCurrentQuery(query)

    const toastId = toast.loading(
      '⚡ Searching across all stores...',
      { duration: Infinity }
    )

    try {
      const data = await apiSearch(query)

      setResults(data.results || [])
      setSearchInfo({
        searchTerm:   data.searchTerm,
        queryType:    data.queryType,
        totalResults: data.totalResults,
        lowestPrice:  data.lowestPrice,
        lowestSite:   data.lowestSite,
        highestPrice: data.highestPrice,
        savings:      data.savings,
        fromCache:    data.fromCache,
      })

      toast.success(
        `Found ${data.totalResults} results! Lowest: ₹${data.lowestPrice?.toLocaleString()} on ${data.lowestSite}`,
        { id: toastId, duration: 4000 }
      )
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.'
      setError(msg)
      toast.error(msg, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setSearchInfo(null)
    setError(null)
    setCurrentQuery('')
  }

  return (
    <SearchContext.Provider value={{
      results,
      loading,
      error,
      searchInfo,
      currentQuery,
      search,
      clearResults,
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider')
  return ctx
}