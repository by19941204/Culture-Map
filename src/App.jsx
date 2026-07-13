import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Compare from './pages/Compare'
import Countries from './pages/Countries'
import CountryDetail from './pages/CountryDetail'
import Dimensions from './pages/Dimensions'
import About from './pages/About'

// Hash routing lets the built app run from any static path (single-file
// exports, file://); normal builds use clean URLs with the Pages base path.
const useHash = import.meta.env.VITE_HASH_ROUTER === '1'
const Router = useHash ? HashRouter : BrowserRouter
const basename = useHash ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router basename={basename}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Compare />} />
              <Route path="countries" element={<Countries />} />
              <Route path="countries/:code" element={<CountryDetail />} />
              <Route path="dimensions" element={<Dimensions />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<Compare />} />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  )
}
