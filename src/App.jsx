import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Compare from './pages/Compare'
import Countries from './pages/Countries'
import CountryDetail from './pages/CountryDetail'
import Dimensions from './pages/Dimensions'
import About from './pages/About'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter basename={basename}>
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
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}
