// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useSearch } from '../context/SearchContext'

// const SearchBar = ({ large = false }) => {
//   const [query, setQuery]   = useState('')
//   const [mode, setMode]     = useState('name')
//   const { search, loading } = useSearch()
//   const navigate            = useNavigate()

//   const isUrl = (str) => { try { new URL(str); return true } catch { return false } }

//   const handleSearch = async (e) => {
//     e.preventDefault()
//     if (!query.trim() || loading) return
//     await search(query.trim())
//     navigate('/results')
//   }

//   const handleInput = (val) => {
//     setQuery(val)
//     setMode(isUrl(val) ? 'url' : 'name')
//   }

//   return (
//     <form onSubmit={handleSearch} className="w-full">

//       {/* Mode tabs */}
//       <div className="flex gap-1 mb-3">
//         {[
//           { key: 'name', label: '⌨  Product name' },
//           { key: 'url',  label: '🔗  Paste URL'    },
//         ].map(({ key, label }) => (
//           <button key={key} type="button"
//             onClick={() => { setMode(key); setQuery('') }}
//             className="px-3 py-1 rounded-md text-xs transition-all duration-150 cursor-pointer"
//             style={{
//               background: mode === key ? 'rgba(233,69,96,0.15)' : 'transparent',
//               color:      mode === key ? '#e94560' : '#8b8ba8',
//               border:     mode === key ? '0.5px solid rgba(233,69,96,0.4)' : '0.5px solid rgba(255,255,255,0.07)',
//               fontFamily: 'Outfit, sans-serif',
//             }}>
//             {label}
//           </button>
//         ))}
//       </div>

//       {/* Input + button */}
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => handleInput(e.target.value)}
//           placeholder={mode === 'url'
//             ? 'Paste product URL — https://amazon.in/...'
//             : 'Search iPhone 15, Samsung TV, Nike shoes...'}
//           disabled={loading}
//           className="flex-1 rounded-xl outline-none transition-all duration-150 text-sm disabled:opacity-50"
//           style={{
//             background:  '#0a0a12',
//             border:      '0.5px solid rgba(255,255,255,0.07)',
//             padding:     large ? '14px 18px' : '11px 14px',
//             color:       '#f0f0f5',
//             fontFamily:  'Outfit, sans-serif',
//             fontSize:    large ? '15px' : '14px',
//           }}
//           onFocus={(e)  => e.target.style.borderColor = 'rgba(233,69,96,0.5)'}
//           onBlur={(e)   => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
//         />
//         <button type="submit" disabled={loading || !query.trim()}
//           className="flex items-center gap-2 rounded-xl font-semibold text-white transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//           style={{
//             background:  loading ? '#1a1a2e' : '#e94560',
//             border:      'none',
//             padding:     large ? '14px 28px' : '11px 20px',
//             fontSize:    large ? '15px' : '13px',
//             fontFamily:  'Outfit, sans-serif',
//           }}
//           onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d63652' }}
//           onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#e94560' }}>
//           {loading
//             ? <><span className="spinner" style={{ width:'16px', height:'16px' }} /> Searching...</>
//             : '⚡ Search'}
//         </button>
//       </div>
//     </form>
//   )
// }

// export default SearchBar

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'

const SearchBar = ({ large = false }) => {
  const [query, setQuery]   = useState('')
  const [mode, setMode]     = useState('name')
  const { search, loading } = useSearch()
  const navigate            = useNavigate()

  const isUrl = (str) => { try { new URL(str); return true } catch { return false } }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim() || loading) return
    await search(query.trim())
    navigate('/results')
  }

  const handleInput = (val) => {
    setQuery(val)
    setMode(isUrl(val) ? 'url' : 'name')
  }

  return (
    <form onSubmit={handleSearch} style={{ width: '100%' }}>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { key: 'name', label: '⌨  Product name' },
          { key: 'url',  label: '🔗  Paste URL'    },
        ].map(({ key, label }) => (
          <button key={key} type="button"
            onClick={() => { setMode(key); setQuery('') }}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: mode === key ? 'rgba(233,69,96,0.15)' : 'transparent',
              color:      mode === key ? '#e94560'               : '#8b8ba8',
              border:     mode === key
                ? '0.5px solid rgba(233,69,96,0.5)'
                : '0.5px solid rgba(255,255,255,0.08)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={mode === 'url'
            ? 'Paste product URL — https://amazon.in/...'
            : 'Search iPhone 15, Samsung TV, Nike shoes...'}
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 0,
            background: '#0a0a12',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: large ? '14px 20px' : '12px 16px',
            fontSize: large ? '15px' : '14px',
            fontFamily: 'Outfit, sans-serif',
            color: '#f0f0f5',
            outline: 'none',
          }}
          onFocus={(e)  => e.target.style.borderColor = 'rgba(233,69,96,0.6)'}
          onBlur={(e)   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            flexShrink: 0,
            background: loading || !query.trim() ? '#1a1a2e' : '#e94560',
            border: 'none',
            borderRadius: '12px',
            padding: large ? '14px 32px' : '12px 24px',
            fontSize: large ? '15px' : '13px',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            color: loading || !query.trim() ? '#4a4a62' : '#fff',
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}>
          {loading
            ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Searching...</>
            : '⚡ Search'
          }
        </button>
      </div>
    </form>
  )
}

export default SearchBar