import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SearchProvider } from './context/SearchContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Results from './pages/Results'
import History from './pages/History'

const App = () => (
  <BrowserRouter>
    <SearchProvider>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131f',
            color: '#f0f0f5',
            border: '0.5px solid rgba(255,255,255,0.07)',
            fontSize: '13px',
            fontFamily: 'Outfit, sans-serif',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#13131f' } },
          error:   { iconTheme: { primary: '#e94560', secondary: '#13131f' } },
        }}
      />

      {/* Sticky top navbar */}
      <Navbar />

      {/* Page routes */}
      <main>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="*"        element={<Home />} />
        </Routes>
      </main>

    </SearchProvider>
  </BrowserRouter>
)

export default App