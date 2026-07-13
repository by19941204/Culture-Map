import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Briefcase, ChevronDown, Lightbulb, Plane } from 'lucide-react'
import { countries } from '../data/countries'
import { dimensions } from '../data/dimensions'
import { adviceBranch, rankDimensions } from '../lib/advice'
import CountrySelect from '../components/CountrySelect'
import CultureMapChart from '../components/CultureMapChart'
import GapBadge from '../components/GapBadge'
import { useLang } from '../i18n/LanguageContext'

const isCode = (v) => countries.some((c) => c.code === v)

function initial(param, storageKey, fallback) {
  if (param && isCode(param)) return param
  const saved = localStorage.getItem(storageKey)
  if (saved && isCode(saved)) return saved
  return fallback
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
                <span className="font-medium">{t('compare.holistic')}：</span>
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
    const p = searchParams.get('ctx') || localStorage.getItem('cm-context')
    return p === 'travel' ? 'travel' : 'work'
  })
  // per-pairing user overrides on top of the "top 3 gaps start expanded" default,
  // so switching countries naturally resets the accordion without an effect
  const [overrides, setOverrides] = useState({ key: '', map: {} })

  useEffect(() => {
    localStorage.setItem('cm-me', myCode)
    localStorage.setItem('cm-them', theirCode)
    localStorage.setItem('cm-context', context)
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

  const tips = theirC && pick(theirC, context === 'work' ? 'workTips' : 'travelTips')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t('compare.title')}</h1>
        <p className="mt-1 text-sm text-ink2">{t('compare.subtitle')}</p>
      </div>

      {/* selectors + scenario, one control row */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <CountrySelect
            value={myCode}
            onChange={setMyCode}
            label={t('compare.me')}
            colorClass="bg-me"
          />
          <button
            onClick={() => {
              setMyCode(theirCode)
              setTheirCode(myCode)
            }}
            className="mx-auto shrink-0 rounded-full border border-line p-2 text-ink2 hover:text-ink sm:mb-1.5"
            title={t('compare.swap')}
            aria-label={t('compare.swap')}
          >
            <ArrowLeftRight size={16} aria-hidden />
          </button>
          <CountrySelect
            value={theirCode}
            onChange={setTheirCode}
            label={t('compare.them')}
            colorClass="bg-them"
          />
        </div>

        <div className="mt-3 flex rounded-xl border border-line bg-page p-1" role="tablist">
          {[
            { id: 'work', icon: Briefcase, key: 'context.work' },
            { id: 'travel', icon: Plane, key: 'context.travel' },
          ].map(({ id, icon: Icon, key }) => (
            <button
              key={id}
              role="tab"
              aria-selected={context === id}
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
                      document.getElementById(`advice-${r.dim.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
                    holisticApplies={r.dim.id === 'persuading' && (myC.holistic || theirC.holistic)}
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
