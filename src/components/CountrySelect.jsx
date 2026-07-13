import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { countries, regionOrder, regions } from '../data/countries'
import { useLang } from '../i18n/LanguageContext'

export default function CountrySelect({ value, onChange, label, colorClass }) {
  const { lang, t, pick } = useLang()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  const selected = countries.find((c) => c.code === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (c) =>
      !q ||
      c.nameZh.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    return regionOrder
      .map((r) => ({ region: r, items: countries.filter((c) => c.region === r && match(c)) }))
      .filter((g) => g.items.length > 0)
  }, [query])

  const choose = (code) => {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <span className={`mb-1 flex items-center gap-1.5 text-xs font-medium text-ink2`}>
        <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} aria-hidden />
        {label}
      </span>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 text-left shadow-sm hover:border-baseline"
      >
        {selected ? (
          <>
            <span className="text-xl leading-none" aria-hidden>{selected.flag}</span>
            <span className="truncate font-medium">{pick(selected, 'name')}</span>
            <span className="hidden text-xs text-ink3 sm:inline">
              {lang === 'zh' ? selected.nameEn : selected.nameZh}
            </span>
          </>
        ) : (
          <span className="text-ink3">{t('select.placeholder')}</span>
        )}
        <ChevronDown size={16} className="ml-auto shrink-0 text-ink3" aria-hidden />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-64 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <Search size={14} className="shrink-0 text-ink3" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('countries.search')}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink3"
            />
          </div>
          <div role="listbox" className="max-h-72 overflow-y-auto py-1">
            {groups.length === 0 && (
              <p className="px-3 py-3 text-sm text-ink3">{t('countries.empty')}</p>
            )}
            {groups.map((g) => (
              <div key={g.region}>
                <p className="px-3 pb-0.5 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink3">
                  {pick(regions[g.region], 'name')}
                </p>
                {g.items.map((c) => (
                  <button
                    key={c.code}
                    role="option"
                    aria-selected={c.code === value}
                    onClick={() => choose(c.code)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-page ${
                      c.code === value ? 'font-medium text-accent' : ''
                    }`}
                  >
                    <span aria-hidden>{c.flag}</span>
                    <span>{pick(c, 'name')}</span>
                    <span className="ml-auto text-xs text-ink3">
                      {lang === 'zh' ? c.nameEn : c.nameZh}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
