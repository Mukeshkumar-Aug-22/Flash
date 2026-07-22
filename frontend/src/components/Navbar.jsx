// import { Link, useLocation } from 'react-router-dom'

// const Navbar = () => {
//   const { pathname } = useLocation()

//   const links = [
//     { to: '/',        label: 'Home',    icon: '⌂' },
//     { to: '/results', label: 'Results', icon: '◈' },
//     { to: '/history', label: 'History', icon: '◷' },
//   ]

//   return (
//     <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
//       style={{ background: '#10101e', borderColor: 'rgba(255,255,255,0.07)' }}>

//       {/* Logo */}
//       <Link to="/" className="flex items-center gap-2 no-underline">
//         <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base"
//           style={{ background: '#e94560', fontFamily: 'Space Mono, monospace' }}>
//           F
//         </div>
//         <span className="text-sm font-bold tracking-widest"
//           style={{ fontFamily: 'Space Mono, monospace', color: '#f0f0f5' }}>
//           FLASH_AI
//         </span>
//       </Link>

//       {/* Nav links */}
//       <div className="flex items-center gap-1">
//         {links.map(({ to, label, icon }) => {
//           const active = pathname === to
//           return (
//             <Link key={to} to={to}
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 no-underline"
//               style={{
//                 background:   active ? '#1a1a2e' : 'transparent',
//                 color:        active ? '#f0f0f5' : '#8b8ba8',
//                 border:       active ? '0.5px solid rgba(255,255,255,0.07)' : '0.5px solid transparent',
//                 fontWeight:   active ? '500' : '400',
//               }}>
//               <span>{icon}</span>
//               <span>{label}</span>
//             </Link>
//           )
//         })}
//       </div>
//     </nav>
//   )
// }

// export default Navbar

import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const { pathname } = useLocation()

  const links = [
    { to: '/',        label: 'Home',    icon: '⌂' },
    { to: '/results', label: 'Results', icon: '◈' },
    { to: '/history', label: 'History', icon: '◷' },
  ]

  return (
    <nav style={{
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '56px',
      background: '#10101e',
      borderBottom: '0.5px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>

      {/* Logo */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        textDecoration: 'none',
      }}>
        <div style={{
          width: '32px', height: '32px',
          background: '#e94560',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Mono, monospace',
          fontSize: '16px', fontWeight: '700', color: '#fff',
        }}>F</div>
        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '14px', fontWeight: '700',
          color: '#f0f0f5', letterSpacing: '2px',
        }}>FLASH_AI</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(({ to, label, icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: active ? '500' : '400',
              color:      active ? '#f0f0f5' : '#8b8ba8',
              background: active ? '#1a1a2e' : 'transparent',
              border:     active ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar