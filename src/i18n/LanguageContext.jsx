import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from './translations'
import { loadPref, savePref } from '../lib/storage'

const LanguageContext = createContext(null)

function initialLang() {
  const saved = loadPref('cm-lang')
  if (saved === 'zh' || saved === 'en') return saved
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    savePref('cm-lang', lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title = `Culture Map · ${translations['app.tagline'][lang]}`
  }, [lang])

  const toggle = () => setLang((l) => (l === 'zh' ? 'en' : 'zh'))
  const t = (key) => translations[key]?.[lang] ?? key
  // pick('note', obj) -> obj.noteZh / obj.noteEn depending on current language
  const pick = (obj, base) => obj?.[base + (lang === 'zh' ? 'Zh' : 'En')]

  return (
    <LanguageContext.Provider value={{ lang, toggle, t, pick }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(LanguageContext)
}
