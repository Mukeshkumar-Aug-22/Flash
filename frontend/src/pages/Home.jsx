// import SearchBar from '../components/SearchBar'

// const SITES    = ['Amazon', 'Flipkart', 'Meesho', 'Snapdeal']
// const FEATURES = [
//   { icon: '⚡', title: 'Instant comparison', desc: 'Search all stores simultaneously in seconds' },
//   { icon: '₹',  title: 'Lowest price found', desc: 'Best deal highlighted automatically for you' },
//   { icon: '🔗', title: 'URL or name search', desc: 'Paste any product link or just type a name' },
//   { icon: '◷', title: 'Search history',      desc: 'Every search saved so you can revisit deals' },
// ]

// const Home = () => (
//   <div className="max-w-2xl mx-auto px-6">

//     {/* ── Hero ───────────────────────────────────── */}
//     <div className="text-center pt-16 pb-12">

//       {/* Badge */}
//       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
//         style={{
//           background:  'rgba(233,69,96,0.12)',
//           border:      '0.5px solid rgba(233,69,96,0.4)',
//           color:       '#e94560',
//           fontFamily:  'Space Mono, monospace',
//           letterSpacing: '1px',
//         }}>
//         ⚡ AI-POWERED PRICE COMPARISON
//       </div>

//       {/* Headline */}
//       <h1 className="font-bold leading-tight mb-4"
//         style={{
//           fontFamily: 'Space Mono, monospace',
//           fontSize:   'clamp(26px, 5vw, 40px)',
//           color:      '#f0f0f5',
//           letterSpacing: '-0.5px',
//         }}>
//         Find the{' '}
//         <span style={{ color: '#e94560' }}>lowest price</span>
//         <br />across every store
//       </h1>

//       {/* Subtext */}
//       <p className="text-sm leading-relaxed mb-10" style={{ color: '#8b8ba8' }}>
//         Paste a product link or type a name —<br />
//         Flash AI searches Amazon, Flipkart, Meesho &amp; Snapdeal instantly
//       </p>

//       {/* Search box card */}
//       <div className="p-5 rounded-2xl mb-5"
//         style={{ background: '#13131f', border: '0.5px solid rgba(255,255,255,0.07)' }}>
//         <SearchBar large />
//       </div>

//       {/* Supported sites pills */}
//       <div className="flex flex-wrap justify-center gap-2">
//         {SITES.map((site) => (
//           <span key={site} className="px-3 py-1 rounded-full text-xs"
//             style={{ background: '#13131f', border: '0.5px solid rgba(255,255,255,0.07)', color: '#8b8ba8' }}>
//             {site}
//           </span>
//         ))}
//         <span className="px-3 py-1 rounded-full text-xs"
//           style={{ background: 'rgba(233,69,96,0.12)', border: '0.5px solid rgba(233,69,96,0.3)', color: '#e94560' }}>
//           + more coming
//         </span>
//       </div>
//     </div>

//     {/* ── Feature cards ──────────────────────────── */}
//     <div className="grid grid-cols-2 gap-3 pb-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
//       {FEATURES.map(({ icon, title, desc }, i) => (
//         <div key={title}
//           className="p-4 rounded-xl"
//           style={{
//             background: '#13131f',
//             border:     '0.5px solid rgba(255,255,255,0.07)',
//             animation:  `fadeUp 0.4s ease ${i * 0.08}s both`,
//           }}>
//           <div className="text-2xl mb-2">{icon}</div>
//           <div className="text-xs font-medium mb-1" style={{ color: '#f0f0f5' }}>{title}</div>
//           <div className="text-xs leading-relaxed" style={{ color: '#8b8ba8' }}>{desc}</div>
//         </div>
//       ))}
//     </div>
//   </div>
// )

// export default Home

import SearchBar from '../components/SearchBar'

const SITES    = ['Amazon', 'Flipkart', 'Meesho', 'Snapdeal']
const FEATURES = [
  { icon: '⚡', title: 'Instant comparison', desc: 'Search all stores simultaneously in seconds' },
  { icon: '₹',  title: 'Lowest price found', desc: 'Best deal highlighted automatically for you' },
  { icon: '🔗', title: 'URL or name search', desc: 'Paste any product link or just type a name' },
  { icon: '◷', title: 'Search history',      desc: 'Every search saved so you can revisit deals' },
]

const Home = () => (
  <div style={{ width: '100%', minHeight: '100vh', background: '#0a0a12' }}>

    {/* ── Hero Section ─────────────────────── */}
    <div style={{
      width: '100%',
      padding: '80px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}>

      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: '999px',
        background: 'rgba(233,69,96,0.12)',
        border: '0.5px solid rgba(233,69,96,0.4)',
        color: '#e94560',
        fontSize: '11px',
        fontFamily: 'Space Mono, monospace',
        letterSpacing: '1.5px',
        marginBottom: '28px',
      }}>
        ⚡ AI-POWERED PRICE COMPARISON
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: 'clamp(28px, 4vw, 52px)',
        fontWeight: '700',
        color: '#f0f0f5',
        lineHeight: '1.2',
        marginBottom: '20px',
        letterSpacing: '-1px',
        maxWidth: '700px',
      }}>
        Find the{' '}
        <span style={{ color: '#e94560' }}>lowest price</span>
        <br />across every store
      </h1>

      {/* Subtext */}
      <p style={{
        fontSize: 'clamp(13px, 1.5vw, 16px)',
        color: '#8b8ba8',
        lineHeight: '1.8',
        marginBottom: '48px',
        maxWidth: '480px',
      }}>
        Paste a product link or type a name —
        Flash AI searches Amazon, Flipkart, Meesho &amp; Snapdeal instantly
      </p>

      {/* Search Card */}
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: '#13131f',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <SearchBar large />
      </div>

      {/* Site pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
      }}>
        {SITES.map((site) => (
          <span key={site} style={{
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            background: '#13131f',
            border: '0.5px solid rgba(255,255,255,0.08)',
            color: '#8b8ba8',
          }}>{site}</span>
        ))}
        <span style={{
          padding: '5px 14px',
          borderRadius: '999px',
          fontSize: '12px',
          background: 'rgba(233,69,96,0.1)',
          border: '0.5px solid rgba(233,69,96,0.3)',
          color: '#e94560',
        }}>+ more coming</span>
      </div>
    </div>

    {/* ── Feature Cards ────────────────────── */}
    <div style={{
      width: '100%',
      padding: '0 24px 80px',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {FEATURES.map(({ icon, title, desc }, i) => (
          <div key={title} style={{
            background: '#13131f',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#f0f0f5',
              marginBottom: '6px',
            }}>{title}</div>
            <div style={{
              fontSize: '13px',
              color: '#8b8ba8',
              lineHeight: '1.6',
            }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>

  </div>
)

export default Home