import { NavLink, Outlet } from 'react-router-dom'
import { ArrowLeftRight, Globe2, SlidersHorizontal, Info, Sun, Moon, Languages } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useLang } from '../i18n/LanguageContext'

const navItems = [
  { to: '/', key: 'nav.compare', icon: ArrowLeftRight, end: true },
  { to: '/countries', key: 'nav.countries', icon: Globe2 },
  { to: '/dimensions', key: 'nav.dimensions', icon: SlidersHorizontal },
  { to: '/about', key: 'nav.about', icon: Info },
]

export default function Layout() {
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t } = useLang()

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
          <NavLink to="/" className="flex items-center gap-2 whitespace-nowrap font-semibold">
            <span aria-hidden>🧭</span>
            <span className="hidden sm:inline">{t('app.name')}</span>
            <span className="hidden text-xs font-normal text-ink3 md:inline">{t('app.tagline')}</span>
          </NavLink>

          <nav className="ml-auto flex items-center gap-1" aria-label="Main">
            {navItems.map(({ to, key, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors sm:px-2.5 ${
                    isActive ? 'bg-card font-medium text-accent shadow-sm' : 'text-ink2 hover:text-ink'
                  }`
                }
              >
                <Icon size={16} aria-hidden />
                <span className="hidden md:inline">{t(key)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-1 flex items-center gap-1 border-l border-line pl-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-ink2 hover:text-ink"
              title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Languages size={16} aria-hidden />
              <span>{lang === 'zh' ? 'EN' : '中'}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-ink2 hover:text-ink"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-5xl space-y-1 border-t border-line px-4 py-6 text-xs text-ink3">
        <p>{t('footer.disclaimer')}</p>
        <p>{t('footer.credit')}</p>
      </footer>
    </div>
  )
}
