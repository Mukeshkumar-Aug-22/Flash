// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useSearch } from '../context/SearchContext'
// import { getHistory, clearHistory, deleteHistoryItem } from '../api/searchApi'
// import toast from 'react-hot-toast'

// const timeAgo = (dateStr) => {
//   const diff  = Date.now() - new Date(dateStr).getTime()
//   const mins  = Math.floor(diff / 60000)
//   const hours = Math.floor(diff / 3600000)
//   const days  = Math.floor(diff / 86400000)
//   if (mins  < 1)  return 'just now'
//   if (mins  < 60) return `${mins}m ago`
//   if (hours < 24) return `${hours}h ago`
//   return `${days}d ago`
// }

// const History = () => {
//   const [history, setHistory] = useState([])
//   const [loading, setLoading] = useState(true)
//   const { search }            = useSearch()
//   const navigate              = useNavigate()

//   useEffect(() => {
//     getHistory()
//       .then((d) => setHistory(d.history || []))
//       .catch(() => toast.error('Failed to load history'))
//       .finally(() => setLoading(false))
//   }, [])

//   const handleClearAll = async () => {
//     if (!window.confirm('Clear all search history?')) return
//     try { await clearHistory(); setHistory([]); toast.success('History cleared') }
//     catch { toast.error('Failed to clear') }
//   }

//   const handleDelete = async (id, e) => {
//     e.stopPropagation()
//     try {
//       await deleteHistoryItem(id)
//       setHistory((prev) => prev.filter((h) => h._id !== id))
//       toast.success('Deleted')
//     } catch { toast.error('Failed to delete') }
//   }

//   const handleReSearch = async (query) => {
//     await search(query)
//     navigate('/results')
//   }

//   if (loading) return (
//     <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-2">
//       {[...Array(5)].map((_, i) => (
//         <div key={i} className="skeleton h-16 rounded-xl" />
//       ))}
//     </div>
//   )

//   return (
//     <div className="max-w-2xl mx-auto px-6 py-6">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <div>
//           <h2 className="text-sm font-medium mb-0.5" style={{ color: '#f0f0f5' }}>Search history</h2>
//           <div className="text-xs" style={{ color: '#8b8ba8' }}>{history.length} past searches</div>
//         </div>
//         {history.length > 0 && (
//           <button onClick={handleClearAll}
//             className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
//             style={{
//               background: 'transparent',
//               border:     '0.5px solid rgba(255,255,255,0.07)',
//               color:      '#8b8ba8',
//               fontFamily: 'Outfit, sans-serif',
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.borderColor='rgba(233,69,96,0.4)'; e.currentTarget.style.color='#e94560' }}
//             onMouseLeave={(e) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#8b8ba8' }}>
//             ✕ Clear all
//           </button>
//         )}
//       </div>

//       {/* Empty state */}
//       {history.length === 0 && (
//         <div className="p-12 rounded-xl text-center"
//           style={{ background: '#13131f', border: '0.5px solid rgba(255,255,255,0.07)' }}>
//           <div className="text-4xl mb-3">◷</div>
//           <div className="text-sm font-medium mb-1.5" style={{ color: '#f0f0f5' }}>No history yet</div>
//           <div className="text-xs mb-5" style={{ color: '#8b8ba8' }}>Your searches will appear here automatically</div>
//           <button onClick={() => navigate('/')}
//             className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer"
//             style={{ background: '#e94560', fontFamily: 'Outfit, sans-serif' }}>
//             Start searching
//           </button>
//         </div>
//       )}

//       {/* History list */}
//       <div className="flex flex-col gap-2">
//         {history.map((item, i) => (
//           <div key={item._id}
//             onClick={() => handleReSearch(item.query)}
//             className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-150"
//             style={{
//               background: '#13131f',
//               border:     '0.5px solid rgba(255,255,255,0.07)',
//               animation:  `fadeUp 0.3s ease ${i * 0.05}s both`,
//             }}
//             onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(233,69,96,0.35)'}
//             onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>

//             {/* Icon */}
//             <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
//               style={{
//                 background: item.type === 'url' ? 'rgba(233,69,96,0.12)' : '#1a1a2e',
//                 color:      item.type === 'url' ? '#e94560'               : '#8b8ba8',
//               }}>
//               {item.type === 'url' ? '🔗' : '◈'}
//             </div>

//             {/* Info */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 mb-0.5">
//                 <span className="text-xs font-medium truncate" style={{ color: '#f0f0f5' }}>{item.query}</span>
//                 <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
//                   style={{ background: '#1a1a2e', color: '#4a4a62', fontSize: '10px' }}>
//                   {item.type}
//                 </span>
//               </div>
//               <div className="text-xs" style={{ color: '#4a4a62' }}>
//                 {item.resultCount} results
//                 {item.savings > 0 && ` · saved ₹${item.savings?.toLocaleString()}`}
//                 {' · '}{timeAgo(item.createdAt)}
//               </div>
//             </div>

//             {/* Price */}
//             <div className="text-right shrink-0">
//               <div className="text-sm font-bold" style={{ fontFamily: 'Space Mono, monospace', color: '#4ade80' }}>
//                 ₹{item.lowestPrice?.toLocaleString()}
//               </div>
//               <div className="text-xs" style={{ color: '#4a4a62' }}>{item.lowestSite}</div>
//             </div>

//             {/* Delete button */}
//             <button
//               onClick={(e) => handleDelete(item._id, e)}
//               className="text-sm px-1.5 py-1 rounded transition-colors duration-150 cursor-pointer border-none"
//               style={{ background: 'transparent', color: '#4a4a62', flexShrink: 0 }}
//               onMouseEnter={(e) => e.currentTarget.style.color = '#e94560'}
//               onMouseLeave={(e) => e.currentTarget.style.color = '#4a4a62'}>
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default History

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'
import { getHistory, clearHistory, deleteHistoryItem } from '../api/searchApi'
import toast from 'react-hot-toast'

const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { search }            = useSearch()
  const navigate              = useNavigate()

  useEffect(() => {
    getHistory()
      .then((d) => setHistory(d.history || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm('Clear all search history?')) return
    try { await clearHistory(); setHistory([]); toast.success('History cleared') }
    catch { toast.error('Failed to clear') }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteHistoryItem(id)
      setHistory((prev) => prev.filter((h) => h._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleReSearch = async (query) => {
    await search(query)
    navigate('/results')
  }

  const WRAP = {
    width: '100%', padding: '32px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  }
  const INNER = { width: '100%', maxWidth: '1100px' }

  if (loading) return (
    <div style={WRAP}>
      <div style={{ ...INNER, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '14px' }} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={WRAP}>
      <div style={INNER}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f5', marginBottom: '4px' }}>
              Search history
            </h2>
            <div style={{ fontSize: '12px', color: '#8b8ba8' }}>
              {history.length} past searches
            </div>
          </div>
          {history.length > 0 && (
            <button onClick={handleClearAll} style={{
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '8px 16px',
              fontSize: '12px', fontFamily: 'Outfit, sans-serif',
              color: '#8b8ba8', cursor: 'pointer',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor='rgba(233,69,96,0.4)'; e.currentTarget.style.color='#e94560' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#8b8ba8' }}>
              ✕ Clear all
            </button>
          )}
        </div>

        {/* Empty */}
        {history.length === 0 && (
          <div style={{
            background: '#13131f', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '64px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>◷</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f5', marginBottom: '8px' }}>
              No history yet
            </div>
            <div style={{ fontSize: '13px', color: '#8b8ba8', marginBottom: '24px' }}>
              Your searches will appear here automatically
            </div>
            <button onClick={() => navigate('/')} style={{
              background: '#e94560', border: 'none', borderRadius: '10px',
              padding: '12px 28px', fontSize: '13px', fontFamily: 'Outfit, sans-serif',
              fontWeight: '600', color: '#fff', cursor: 'pointer',
            }}>Start searching</button>
          </div>
        )}

        {/* History grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '12px',
        }}>
          {history.map((item, i) => (
            <div key={item._id}
              onClick={() => handleReSearch(item.query)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 20px', borderRadius: '14px', cursor: 'pointer',
                background: '#13131f',
                border: '0.5px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.15s',
                animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(233,69,96,0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>

              {/* Icon */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
                background: item.type === 'url' ? 'rgba(233,69,96,0.12)' : '#1a1a2e',
                color:      item.type === 'url' ? '#e94560'               : '#8b8ba8',
              }}>
                {item.type === 'url' ? '🔗' : '◈'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: '500', color: '#f0f0f5',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{item.query}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                    background: '#1a1a2e', color: '#4a4a62', flexShrink: 0,
                  }}>{item.type}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#4a4a62' }}>
                  {item.resultCount} results
                  {item.savings > 0 && ` · saved ₹${item.savings?.toLocaleString()}`}
                  {' · '}{timeAgo(item.createdAt)}
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  fontFamily: 'Space Mono, monospace', color: '#4ade80',
                }}>₹{item.lowestPrice?.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#4a4a62' }}>{item.lowestSite}</div>
              </div>

              {/* Delete */}
              <button onClick={(e) => handleDelete(item._id, e)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#4a4a62', fontSize: '16px', padding: '4px',
                flexShrink: 0, borderRadius: '4px', transition: 'color 0.15s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e94560'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#4a4a62'}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default History