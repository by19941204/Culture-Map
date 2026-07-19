import { createContext, useContext } from 'react'

export const LanguageContext = createContext(null)

// { lang: 'zh'|'en', t(key), pick(obj, base), toggleLang } — provided by the
// PrefsProvider in App.js
export function useLang() {
  return useContext(LanguageContext)
}
