import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { countries, regionOrder, regions } from '../data/countries'
import { useLang } from '../i18n/LanguageContext'

export default function Countries() {
  const { lang, pick, t } = useLang()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return countries.filter(
      (c) =>
        (region === 'all' || c.region === region) &&
        (!q ||
          c.nameZh.includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)),
    )
  }, [query, region])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t('countries.title')}</h1>
        <p className="mt-1 text-sm text-ink2">{t('countries.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 shadow-sm sm:w-64">
          <Search size={15} className="shrink-0 text-ink3" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('countries.search')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink3"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', ...regionOrder].map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                region === r
                  ? 'border-accent font-medium text-accent'
                  : 'border-line text-ink2 hover:text-ink'
              }`}
            >
              {r === 'all' ? t('countries.all') : pick(regions[r], 'name')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-4 text-sm text-ink2 shadow-sm">
          {t('countries.empty')}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.code}
              to={`/countries/${c.code}`}
              className="rounded-2xl border border-line bg-card p-4 shadow-sm transition-colors hover:border-baseline"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{c.flag}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{pick(c, 'name')}</p>
                  <p className="truncate text-xs text-ink3">
                    {lang === 'zh' ? c.nameEn : c.nameZh} · {pick(regions[c.region], 'name')}
                  </p>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink2">{pick(c, 'note')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
