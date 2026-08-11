import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Briefcase, ChevronDown, History, Lightbulb, Plane } from 'lucide-react'
import { countries } from '../data/countries'
import { dimensions } from '../data/dimensions'
import { adviceBranch, overallDistance, rankDimensions } from '../lib/advice'
import CountrySelect from '../components/CountrySelect'
import CultureMapChart from '../components/CultureMapChart'
import GapBadge from '../components/GapBadge'
import { useLang } from '../i18n/LanguageContext'
import { loadPref, savePref } from '../lib/storage'

const isCode = (v) => countries.some((c) => c.code === v)

function initial(param, storageKey, fallback) {
  if (param && isCode(param)) return param
  const saved = loadPref(storageKey)
  if (saved && isCode(saved)) return saved
  return fallback
}

// Tiny two-dot spectrum so a gap's size is visible at a glance.
function MiniSpectrum({ my, their }) {
  const pos = (v) => `${4 + (Math.max(0, Math.min(100, v)) / 100) * 92}%`
  return (
    <div className="relative mt-2.5 h-3" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <div
        className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-baseline"
        style={{
          left: pos(Math.min(my, their)),
          width: `${(Math.abs(my - their) / 100) * 92}%`,
        }}
      />
      <span
        className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-me ring-2 ring-card"
        style={{ left: pos(my) }}
      />
      <span
        className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-them ring-2 ring-card"
        style={{ left: pos(their) }}
      />
    </div>
  )
}

function LeanPhrase({ entry }) {
  const { lang, pick, t } = useLang()
  if (entry.level === 'aligned') return null
  const label = pick(entry.dim, entry.gap > 0 ? 'highLabel' : 'lowLabel')
  return (
    <span className="text-xs text-ink2">
      {lang === 'zh' ? `${t('compare.theyLean')}「${label}」` : `${t('compare.theyLean')} “${label}”`}
    </span>
  )
}

function AdviceCard({ entry, context, expanded, onToggle, holisticApplies }) {
  const { lang, pick, t } = useLang()
  const branch = adviceBranch(entry.dim, entry.gap)
  const items = branch[context][lang]
  const holisticNote = holisticApplies ? pick(entry.dim, 'holisticNote') : null

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-medium">{pick(entry.dim, 'name')}</span>
            <LeanPhrase entry={entry} />
          </div>
        </div>
        <GapBadge gap={entry.gap} />
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="border-t border-line px-4 py-3">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {holisticNote && (
            <p className="mt-3 flex gap-2 rounded-lg bg-page px-3 py-2 text-xs leading-relaxed text-ink2">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <span>
                <span className="font-medium">{t('compare.holistic')}{lang === 'zh' ? '：' : ': '}</span>
                {holisticNote}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function Compare() {
  const { lang, pick, t } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()

  const [myCode, setMyCode] = useState(() => initial(searchParams.get('me'), 'cm-me', 'CN'))
  const [theirCode, setTheirCode] = useState(() => initial(searchParams.get('them'), 'cm-them', 'US'))
  const [context, setContext] = useState(() => {
    const p = searchParams.get('ctx') || loadPref('cm-context')
    return p === 'travel' ? 'travel' : 'work'
  })
  // per-pairing user overrides on top of the "top 3 gaps start expanded" default,
  // so switching countries naturally resets the accordion without an effect
  const [overrides, setOverrides] = useState({ key: '', map: {} })

  // counterparts the user compared against recently, most recent first
  const [recent, setRecent] = useState(() =>
    (loadPref('cm-recent') || '').split(',').filter(isCode),
  )
  const chooseThem = (code) => {
    setTheirCode(code)
    setRecent((prev) => {
      const next = [code, ...prev.filter((c) => c !== code)].slice(0, 6)
      savePref('cm-recent', next.join(','))
      return next
    })
  }

  useEffect(() => {
    savePref('cm-me', myCode)
    savePref('cm-them', theirCode)
    savePref('cm-context', context)
    setSearchParams({ me: myCode, them: theirCode, ctx: context }, { replace: true })
  }, [myCode, theirCode, context, setSearchParams])

  const myC = countries.find((c) => c.code === myCode)
  const theirC = countries.find((c) => c.code === theirCode)
  const same = myCode === theirCode

  const ranked = useMemo(
    () => (same ? [] : rankDimensions(dimensions, myC, theirC)),
    [same, myC, theirC],
  )

  const pairKey = `${myCode}|${theirCode}`
  const defaultOpen = new Set(ranked.slice(0, 3).map((r) => r.dim.id))
  const isExpanded = (id) =>
    overrides.key === pairKey && id in overrides.map ? overrides.map[id] : defaultOpen.has(id)
  const setOpen = (id, open) =>
    setOverrides((prev) => ({
      key: pairKey,
      map: { ...(prev.key === pairKey ? prev.map : {}), [id]: open },
    }))

  const topGaps = ranked.filter((r) => r.level !== 'aligned').slice(0, 3)
  const distance = overallDistance(ranked)

  const tips = theirC && pick(theirC, context === 'work' ? 'workTips' : 'travelTips')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t('compare.title')}</h1>
        <p className="mt-1 text-sm text-ink2">{t('compare.subtitle')}</p>
      </div>

      {/* selectors + scenario: "me" is set once, so it stays compact; the
          counterpart is the everyday choice and gets the prominent picker */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <CountrySelect
            value={myCode}
            onChange={setMyCode}
            label={t('compare.me')}
            colorClass="bg-me"
            compact
          />
          <button
            onClick={() => {
              setMyCode(theirCode)
              chooseThem(myCode)
            }}
            className="shrink-0 rounded-full border border-line p-1.5 text-ink2 hover:text-ink"
            title={t('compare.swap')}
            aria-label={t('compare.swap')}
          >
            <ArrowLeftRight size={14} aria-hidden />
          </button>
        </div>

        <div className="mt-2">
          <CountrySelect
            value={theirCode}
            onChange={chooseThem}
            label={t('compare.them')}
            colorClass="bg-them"
          />
        </div>

        {recent.filter((c) => c !== theirCode && c !== myCode).length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs text-ink3">
              <History size={12} aria-hidden />
              {t('compare.recent')}
            </span>
            {recent
              .filter((c) => c !== theirCode && c !== myCode)
              .slice(0, 4)
              .map((code) => {
                const c = countries.find((x) => x.code === code)
                return (
                  <button
                    key={code}
                    onClick={() => chooseThem(code)}
                    className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink2 hover:border-baseline hover:text-ink"
                  >
                    {c.flag} {pick(c, 'name')}
                  </button>
                )
              })}
          </div>
        )}

        <div className="mt-3 flex rounded-xl border border-line bg-page p-1">
          {[
            { id: 'work', icon: Briefcase, key: 'context.work' },
            { id: 'travel', icon: Plane, key: 'context.travel' },
          ].map(({ id, icon: Icon, key }) => (
            <button
              key={id}
              aria-pressed={context === id}
              onClick={() => setContext(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                context === id ? 'bg-card font-medium text-accent shadow-sm' : 'text-ink2'
              }`}
            >
              <Icon size={15} aria-hidden />
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {same ? (
        <div className="rounded-2xl border border-line bg-card p-4 text-sm text-ink2 shadow-sm">
          {t('compare.same')}
        </div>
      ) : (
        <>
          {/* the one-glance verdict first, details after */}
          <section aria-labelledby="distance">
            <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="distance" className="text-sm font-medium text-ink2">
                  {t('compare.distance')}
                </h2>
                <span className="text-sm font-semibold">{t(`distance.${distance.level}`)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, (distance.avg / 40) * 100)}%` }}
                />
              </div>
              {topGaps.length > 0 && (
                <p className="mt-2 text-xs text-ink3">
                  {t('compare.focusOn')}
                  {lang === 'zh' ? '：' : ': '}
                  {topGaps
                    .slice(0, 2)
                    .map((r) => pick(r.dim, 'name'))
                    .join(lang === 'zh' ? '、' : ', ')}
                </p>
              )}
            </div>
          </section>

          {/* biggest gaps, at a glance */}
          <section aria-labelledby="top-gaps">
            <h2 id="top-gaps" className="mb-2 text-lg font-semibold">
              {t('compare.topGaps')}
            </h2>
            {topGaps.length === 0 ? (
              <p className="rounded-2xl border border-line bg-card p-4 text-sm text-ink2 shadow-sm">
                {t('compare.noGaps')}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {topGaps.map((r, i) => (
                  <button
                    key={r.dim.id}
                    onClick={() => {
                      setOpen(r.dim.id, true)
                      const el = document.getElementById(`advice-${r.dim.id}`)
                      el?.querySelector('button')?.focus({ preventScroll: true })
                      el?.scrollIntoView({
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                          ? 'auto'
                          : 'smooth',
                        block: 'center',
                      })
                    }}
                    className="rounded-2xl border border-line bg-card p-4 text-left shadow-sm hover:border-baseline"
                  >
                    <p className="text-xs text-ink3">#{i + 1}</p>
                    <p className="mt-0.5 font-semibold">{pick(r.dim, 'name')}</p>
                    <p className="mt-1 text-sm text-ink2">
                      {lang === 'zh'
                        ? `${t('compare.theyLean')}「${pick(r.dim, r.gap > 0 ? 'highLabel' : 'lowLabel')}」`
                        : `${t('compare.theyLean')} “${pick(r.dim, r.gap > 0 ? 'highLabel' : 'lowLabel')}”`}
                    </p>
                    <MiniSpectrum my={r.my} their={r.their} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* the map itself */}
          <section aria-labelledby="map">
            <h2 id="map" className="mb-2 text-lg font-semibold">
              {t('compare.map')}
            </h2>
            <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
              <CultureMapChart a={myC} b={theirC} />
            </div>
          </section>

          {/* advice, largest gap first */}
          <section aria-labelledby="advice">
            <div className="mb-2 flex items-baseline gap-2">
              <h2 id="advice" className="text-lg font-semibold">
                {t('compare.advice')}
              </h2>
              <span className="text-xs text-ink3">{t('compare.adviceHint')}</span>
            </div>
            <div className="space-y-2">
              {ranked.map((r) => (
                <div key={r.dim.id} id={`advice-${r.dim.id}`}>
                  <AdviceCard
                    entry={r}
                    context={context}
                    expanded={isExpanded(r.dim.id)}
                    onToggle={() => setOpen(r.dim.id, !isExpanded(r.dim.id))}
                    holisticApplies={r.dim.id === 'persuading' && theirC.holistic}
                  />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* counterpart quick guide */}
      {theirC && (
        <section aria-labelledby="about-them">
          <h2 id="about-them" className="mb-2 text-lg font-semibold">
            {t('compare.aboutThem')}
            {pick(theirC, 'name')} {theirC.flag}
          </h2>
          <div className="space-y-3 rounded-2xl border border-line bg-card p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-ink2">{pick(theirC, 'note')}</p>
            <div>
              <h3 className="mb-1.5 text-sm font-semibold">
                {t(context === 'work' ? 'compare.workTips' : 'compare.travelTips')}
              </h3>
              <ul className="space-y-1.5">
                {tips?.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-them" aria-hidden />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
