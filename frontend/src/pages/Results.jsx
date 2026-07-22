import { useNavigate } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

const WRAP = {
  width: '100%',
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}
const INNER = {
  width: '100%',
  maxWidth: '1100px',
}

const StatCard = ({ label, value, sub, green, red }) => (
  <div style={{
    background: '#13131f',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '16px 20px',
  }}>
    <div style={{ fontSize: '11px', color: '#8b8ba8', marginBottom: '6px' }}>{label}</div>
    <div style={{
      fontSize: '22px', fontWeight: '700',
      fontFamily: 'Space Mono, monospace',
      color: green ? '#4ade80' : red ? '#e94560' : '#f0f0f5',
    }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: '#4a4a62', marginTop: '4px' }}>{sub}</div>}
  </div>
)

const SkeletonCard = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px', borderRadius: '14px',
    background: '#13131f', border: '0.5px solid rgba(255,255,255,0.08)',
  }}>
    <div className="skeleton" style={{ width: '24px', height: '16px', borderRadius: '4px' }} />
    <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
      <div className="skeleton" style={{ width: '60px', height: '11px' }} />
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div className="skeleton" style={{ width: '80px', height: '20px', marginBottom: '6px' }} />
      <div className="skeleton" style={{ width: '60px', height: '12px' }} />
    </div>
  </div>
)

const EmptyBox = ({ icon, title, desc, btnLabel, onBtn }) => (
  <div style={{
    background: '#13131f', border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '64px 32px', textAlign: 'center',
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f5', marginBottom: '8px' }}>{title}</div>
    <div style={{ fontSize: '13px', color: '#8b8ba8', marginBottom: '24px', lineHeight: '1.6' }}>{desc}</div>
    <button onClick={onBtn} style={{
      background: '#e94560', border: 'none', borderRadius: '10px',
      padding: '12px 28px', fontSize: '13px', fontFamily: 'Outfit, sans-serif',
      fontWeight: '600', color: '#fff', cursor: 'pointer',
    }}>{btnLabel}</button>
  </div>
)

const Results = () => {
  const { results, loading, error, searchInfo, currentQuery, clearResults } = useSearch()
  const navigate = useNavigate()
  const handleNew = () => { clearResults(); navigate('/') }

  if (loading) return (
    <div style={WRAP}>
      <div style={INNER}>
        <div style={{ marginBottom: '24px' }}><SearchBar /></div>
        <div style={{ textAlign: 'center', padding: '48px 0', marginBottom: '32px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '14px', color: '#8b8ba8' }}>
            Searching Amazon, Flipkart, Meesho &amp; Snapdeal...
          </div>
          <div style={{ fontSize: '12px', color: '#4a4a62', marginTop: '8px' }}>
            Takes 20–30 seconds while we scan all stores
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div style={WRAP}>
      <div style={INNER}>
        <div style={{ marginBottom: '24px' }}><SearchBar /></div>
        <EmptyBox icon="✕" title="No results found" desc={error}
          btnLabel="Try another search" onBtn={handleNew} />
      </div>
    </div>
  )

  if (!results.length) return (
    <div style={WRAP}>
      <div style={INNER}>
        <div style={{ marginBottom: '24px' }}><SearchBar /></div>
        <EmptyBox icon="◈" title="No results yet"
          desc="Use the search bar above or go back home to start a new search"
          btnLabel="Back to home" onBtn={handleNew} />
      </div>
    </div>
  )

  return (
    <div style={WRAP}>
      <div style={INNER}>

        {/* Search bar */}
        <div style={{ marginBottom: '24px' }}><SearchBar /></div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
          marginBottom: '20px',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f5', marginBottom: '4px' }}>
              Results for "{searchInfo?.searchTerm || currentQuery}"
            </h2>
            <div style={{ fontSize: '12px', color: '#8b8ba8' }}>
              {searchInfo?.totalResults} results across 4 stores
              {searchInfo?.fromCache && (
                <span style={{ marginLeft: '10px', color: '#e94560', fontSize: '11px' }}>
                  cached ⚡
                </span>
              )}
            </div>
          </div>
          <button onClick={handleNew} style={{
            background: 'transparent',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '8px 16px',
            fontSize: '12px', fontFamily: 'Outfit, sans-serif',
            color: '#8b8ba8', cursor: 'pointer',
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(233,69,96,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
            ← New search
          </button>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <StatCard label="Lowest price"  value={`₹${searchInfo?.lowestPrice?.toLocaleString()}`}  sub={searchInfo?.lowestSite} green />
          <StatCard label="Highest price" value={`₹${searchInfo?.highestPrice?.toLocaleString()}`} red />
          <StatCard label="You save"      value={`₹${searchInfo?.savings?.toLocaleString()}`}       sub="vs highest price" green />
          <StatCard label="Total results" value={searchInfo?.totalResults} sub="across all stores" />
        </div>

        {/* Product cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '12px',
        }}>
          {results.map((product, i) => (
            <ProductCard key={`${product.site}-${i}`} product={product} rank={i} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default Results