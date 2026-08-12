import { createContext, useContext, useState } from 'react'
import { searchProducts as apiSearch } from '../api/searchApi'
import toast from 'react-hot-toast'

const SearchContext = createContext()

export const SearchProvider = ({ children }) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
      console.log('📤 Sending search request for:', query)

      const data = await apiSearch(query)
      
      console.log('📦 Full API Response:', data)
      console.log('📦 Results:', data?.results)
      console.log('📦 totalResults:', data?.totalResults)

      if (!data) {
        throw new Error('No data received from server')
      }

      // ✅ Get results array (handle both formats)
      const resultsArray = data.results || []
      console.log('📊 Results array length:', resultsArray.length)

      setResults(resultsArray)

      // ✅ Calculate stats from results if not provided
      const prices = resultsArray.map(r => r.price).filter(p => p > 0)
      const lowestPrice = data.lowestPrice || (prices.length > 0 ? Math.min(...prices) : 0)
      const highestPrice = data.highestPrice || (prices.length > 0 ? Math.max(...prices) : 0)
      const lowestResult = resultsArray.find(r => r.price === lowestPrice)

      const info = {
        searchTerm: data.searchTerm || query || 'Unknown',
        queryType: data.queryType || 'name',
        totalResults: data.totalResults || resultsArray.length || 0,
        lowestPrice: lowestPrice,
        lowestSite: data.lowestSite || lowestResult?.site || 'N/A',
        highestPrice: highestPrice,
        savings: data.savings || (highestPrice - lowestPrice) || 0,
        fromCache: data.fromCache || false,
      }

      console.log('📊 Search Info:', info)
      setSearchInfo(info)

      // ✅ Show success toast
      const total = info.totalResults
      const price = info.lowestPrice
      const site = info.lowestSite

      if (total > 0 && price > 0) {
        toast.success(
          `Found ${total} results! Lowest: ₹${price.toLocaleString()} on ${site}`,
          { id: toastId, duration: 4000 }
        )
      } else if (total > 0) {
        toast.success(`Found ${total} results!`, { id: toastId, duration: 4000 })
      } else {
        toast.error('No results found. Try a different search.', { id: toastId })
      }

    } catch (err) {
      console.error('❌ Search error:', err)
      console.error('❌ Error details:', err.response?.data || err.message)

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