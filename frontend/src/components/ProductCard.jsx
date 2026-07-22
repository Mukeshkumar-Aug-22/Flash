const SITE_META = {
  Amazon:   { color: '#FF9900', textColor: '#111', letter: 'A' },
  Flipkart: { color: '#2874f0', textColor: '#fff', letter: 'F' },
  Meesho:   { color: '#f43397', textColor: '#fff', letter: 'M' },
  Snapdeal: { color: '#e40000', textColor: '#fff', letter: 'S' },
}

const SiteAvatar = ({ site }) => {
  const meta = SITE_META[site] || { color: '#4a4a62', textColor: '#fff', letter: site[0] }
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
      style={{ background: meta.color, color: meta.textColor, fontFamily: 'Space Mono, monospace' }}>
      {meta.letter}
    </div>
  )
}

const ProductCard = ({ product, rank }) => {
  const isLowest = rank === 0
  const { site, title, price, originalPrice, discount, image, url, rating, ratingCount } = product

  return (
    <div
      onClick={() => window.open(url, '_blank')}
      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-150"
      style={{
        background:   '#13131f',
        border:       isLowest ? '1px solid rgba(74,222,128,0.4)' : '0.5px solid rgba(255,255,255,0.07)',
        animation:    `fadeUp 0.3s ease ${rank * 0.06}s both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isLowest ? 'rgba(74,222,128,0.7)' : 'rgba(233,69,96,0.4)'
        e.currentTarget.style.transform   = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isLowest ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform   = 'translateY(0)'
      }}
    >
      {/* Rank number */}
      <div className="w-6 text-center text-xs shrink-0"
        style={{ color: isLowest ? '#4ade80' : '#4a4a62', fontFamily: 'Space Mono, monospace' }}>
        #{rank + 1}
      </div>

      {/* Product image or site avatar */}
      {image
        ? <img src={image} alt={title}
            className="w-14 h-14 object-contain rounded-xl bg-white shrink-0"
            onError={(e) => e.target.replaceWith(Object.assign(document.createElement('div')))}
          />
        : <SiteAvatar site={site} />
      }

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium" style={{ color: '#8b8ba8' }}>{site}</span>
          {isLowest && (
            <span className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '0.5px solid rgba(74,222,128,0.3)', fontSize: '10px' }}>
              LOWEST
            </span>
          )}
        </div>
        <div className="text-sm mb-1 truncate" style={{ color: '#f0f0f5' }}>{title}</div>
        {rating && (
          <div className="text-xs" style={{ color: '#4a4a62' }}>
            ★ {rating}{ratingCount && ` · ${ratingCount}`}
          </div>
        )}
      </div>

      {/* Price column */}
      <div className="text-right shrink-0">
        <div className="text-xl font-bold"
          style={{ color: isLowest ? '#4ade80' : '#f0f0f5', fontFamily: 'Space Mono, monospace' }}>
          ₹{price?.toLocaleString()}
        </div>
        {originalPrice && (
          <div className="text-xs line-through" style={{ color: '#4a4a62' }}>
            ₹{originalPrice?.toLocaleString()}
          </div>
        )}
        {discount && (
          <div className="text-xs mt-0.5" style={{ color: '#4ade80' }}>{discount}</div>
        )}
        <div className="mt-1.5 inline-block px-2.5 py-1 rounded-md text-xs"
          style={{ background: '#1a1a2e', border: '0.5px solid rgba(255,255,255,0.07)', color: '#8b8ba8' }}>
          Visit ↗
        </div>
      </div>
    </div>
  )
}

export default ProductCard