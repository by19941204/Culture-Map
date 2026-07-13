import { Lightbulb } from 'lucide-react'
import { dimensions } from '../data/dimensions'
import { useLang } from '../i18n/LanguageContext'

function Pole({ heading, label, behaviors }) {
  return (
    <div className="rounded-xl bg-page p-3">
      <p className="text-[11px] uppercase tracking-wide text-ink3">{heading}</p>
      <p className="mt-0.5 text-sm font-semibold">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {behaviors.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-baseline" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Dimensions() {
  const { pick, t } = useLang()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t('dimensions.title')}</h1>
        <p className="mt-1 text-sm text-ink2">{t('dimensions.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {dimensions.map((dim, i) => (
          <section
            key={dim.id}
            aria-labelledby={`dim-${dim.id}`}
            className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-ink3">{String(i + 1).padStart(2, '0')}</span>
              <h2 id={`dim-${dim.id}`} className="text-lg font-semibold">{pick(dim, 'name')}</h2>
            </div>
            <p className="mt-0.5 text-sm text-ink3">{pick(dim, 'tagline')}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink2">{pick(dim, 'desc')}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Pole
                heading={`${t('dimensions.lowPole')} · 0`}
                label={pick(dim, 'lowLabel')}
                behaviors={pick(dim, 'lowBehaviors')}
              />
              <Pole
                heading={`${t('dimensions.highPole')} · 100`}
                label={pick(dim, 'highLabel')}
                behaviors={pick(dim, 'highBehaviors')}
              />
            </div>

            {dim.holisticNoteZh && (
              <p className="mt-3 flex gap-2 rounded-lg bg-page px-3 py-2 text-xs leading-relaxed text-ink2">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <span>
                  <span className="font-medium">{t('compare.holistic')}：</span>
                  {pick(dim, 'holisticNote')}
                </span>
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
