import { useState } from 'react'
import { dimensions } from '../data/dimensions'
import { useLang } from '../i18n/LanguageContext'
import GapBadge from './GapBadge'

// Percent position clamped so a dot never bleeds past the track ends.
const pos = (v) => `${2 + (Math.max(0, Math.min(100, v)) / 100) * 96}%`

// A dot is a real button: hover/focus shows the tooltip on desktop, and a tap
// toggles it on touch devices (where hover/focus-visible never fire).
function Dot({ id, value, country, dimName, colorClass, pick, nudge = 0, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`group absolute top-1/2 z-10 block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card ${colorClass}`}
      style={{ left: pos(value), marginTop: nudge }}
      aria-label={`${dimName} — ${pick(country, 'name')}: ${value}/100`}
      aria-pressed={active}
    >
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-card px-2 py-1 text-xs text-ink shadow-md ${
          active ? 'block' : 'hidden group-hover:block group-focus-visible:block'
        }`}
      >
        {country.flag} {pick(country, 'name')} · {value}/100
      </span>
    </button>
  )
}

/**
 * The classic culture-map view: 8 horizontal spectra, one dot per culture.
 * `a` is required; `b` is optional (single-country profile mode).
 */
export default function CultureMapChart({ a, b }) {
  const { t, pick } = useLang()
  const [active, setActive] = useState(null)
  const toggle = (id) => setActive((cur) => (cur === id ? null : id))

  return (
    <div>
      {b && (
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-me" aria-hidden />
            <span className="text-ink2">{a.flag} {pick(a, 'name')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-them" aria-hidden />
            <span className="text-ink2">{b.flag} {pick(b, 'name')}</span>
          </span>
          <span className="ml-auto hidden text-xs text-ink3 sm:inline">{t('compare.mapHint')}</span>
        </div>
      )}

      <div className="divide-y divide-line">
        {dimensions.map((dim) => {
          const av = a.scores[dim.id]
          const bv = b?.scores[dim.id]
          // nudge near-identical dots apart vertically so neither hides the other
          const nudge = b && Math.abs(av - bv) < 4 ? 4 : 0
          const dimName = pick(dim, 'name')
          return (
            <div key={dim.id} className="py-3">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{dimName}</span>
                {b && <GapBadge gap={bv - av} />}
              </div>

              <div className="relative h-7">
                <div className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden />
                {b && av !== bv && (
                  <div
                    className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-baseline"
                    style={{
                      left: pos(Math.min(av, bv)),
                      width: `${(Math.abs(av - bv) / 100) * 96}%`,
                    }}
                    aria-hidden
                  />
                )}
                <Dot
                  id={`${dim.id}:a`}
                  value={av}
                  country={a}
                  dimName={dimName}
                  colorClass="bg-me"
                  pick={pick}
                  nudge={-nudge}
                  active={active === `${dim.id}:a`}
                  onToggle={toggle}
                />
                {b && (
                  <Dot
                    id={`${dim.id}:b`}
                    value={bv}
                    country={b}
                    dimName={dimName}
                    colorClass="bg-them"
                    pick={pick}
                    nudge={nudge}
                    active={active === `${dim.id}:b`}
                    onToggle={toggle}
                  />
                )}
              </div>

              <div className="mt-0.5 flex justify-between gap-4 text-[11px] leading-tight text-ink3">
                <span>← {pick(dim, 'lowLabel')}</span>
                <span className="text-right">{pick(dim, 'highLabel')} →</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
