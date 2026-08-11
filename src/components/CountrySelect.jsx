import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { countries, regionOrder, regions } from '../data/countries'
import { useLang } from '../i18n/LanguageContext'

export default function CountrySelect({ value, onChange, label, colorClass, compact = false }) {
  const { lang, t, pick } = useLang()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listId = useId()

  const selected = countries.find((c) => c.code === value)

  const close = (refocus = true) => {
    setOpen(false)
    setQuery('')
    if (refocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
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

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])
  const highlighted = flat[Math.min(highlight, flat.length - 1)]

  useEffect(() => {
    if (!open || !highlighted) return
    document.getElementById(`cs-opt-${listId}-${highlighted.code}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, highlighted, listId])

  const choose = (code) => {
    onChange(code)
    close()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted) choose(highlighted.code)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${compact ? '' : 'flex-1'}`}>
      {!compact && (
        <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink2">
          <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} aria-hidden />
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen((o) => !o)
          setHighlight(0)
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={
          compact
            ? 'flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-ink2 hover:bg-page'
            : 'flex w-full items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 text-left shadow-sm hover:border-baseline'
        }
      >
        {compact ? (
          <>
            <span className={`h-2 w-2 rounded-full ${colorClass}`} aria-hidden />
            <span className="text-xs text-ink3">{label}</span>
            {selected && (
              <span className="font-medium text-ink">
                {selected.flag} {pick(selected, 'name')}
              </span>
            )}
            <span className="text-xs text-accent">{t('compare.edit')}</span>
          </>
        ) : selected ? (
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
        {!compact && <ChevronDown size={16} className="ml-auto shrink-0 text-ink3" aria-hidden />}
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-64 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <Search size={14} className="shrink-0 text-ink3" aria-hidden />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={highlighted ? `cs-opt-${listId}-${highlighted.code}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setHighlight(0)
              }}
              onKeyDown={onKeyDown}
              placeholder={t('countries.search')}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink3"
            />
          </div>
          <div id={listId} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {flat.length === 0 && (
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
                    id={`cs-opt-${listId}-${c.code}`}
                    role="option"
                    aria-selected={c.code === value}
                    tabIndex={-1}
                    onClick={() => choose(c.code)}
                    onMouseMove={() => {
                      const idx = flat.indexOf(c)
                      if (idx >= 0 && idx !== highlight) setHighlight(idx)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                      highlighted?.code === c.code ? 'bg-page' : ''
                    } ${c.code === value ? 'font-medium text-accent' : ''}`}
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
