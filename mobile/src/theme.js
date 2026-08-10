import { createContext, useContext } from 'react'

// Same design tokens as the web app (src/index.css), validated for
// colorblind-safe series colors and WCAG AA muted text in both modes.
export const palettes = {
  light: {
    page: '#f9f9f7',
    card: '#fcfcfb',
    ink: '#0b0b0b',
    ink2: '#52514e',
    ink3: '#6e6c66',
    line: '#e1e0d9',
    baseline: '#c3c2b7',
    accent: '#2a78d6',
    me: '#2a78d6',
    them: '#eb6834',
  },
  dark: {
    page: '#0d0d0d',
    card: '#1a1a19',
    ink: '#ffffff',
    ink2: '#c3c2b7',
    ink3: '#898781',
    line: '#2c2c2a',
    baseline: '#383835',
    accent: '#3987e5',
    me: '#3987e5',
    them: '#d95926',
  },
}

export const ThemeContext = createContext(null)

// { colors, dark, toggleTheme } — provided by the PrefsProvider in App.js
export function useTheme() {
  return useContext(ThemeContext)
}
