import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowLeftRight, Briefcase, Plane } from 'lucide-react'
import { countries, regions } from '../data/countries'
import CultureMapChart from '../components/CultureMapChart'
import { useLang } from '../i18n/LanguageContext'
import { loadPref } from '../lib/storage'

function TipList({ title, icon: Icon, tips }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon size={15} className="text-accent" aria-hidden />
        {title}
      </h2>
      <ul className="space-y-1.5">
        {tips?.map((tip, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CountryDetail() {
  const { code } = useParams()
  const { lang, pick, t } = useLang()
  const country = countries.find((c) => c.code === code?.toUpperCase())

  if (!country) {
    return (
      <div className="space-y-3">
        <p className="text-ink2">{t('country.notFound')}</p>
        <Link to="/countries" className="inline-flex items-center gap-1 text-sm text-accent">
          <ArrowLeft size={14} aria-hidden /> {t('country.back')}
        </Link>
      </div>
    )
  }

  const me = loadPref('cm-me') || 'CN'
  const compareTarget =
    me === country.code
      ? `/?me=${country.code}&them=${country.code === 'US' ? 'CN' : 'US'}`
      : `/?me=${me}&them=${country.code}`

  return (
    <div className="space-y-5">
      <Link to="/countries" className="inline-flex items-center gap-1 text-sm text-ink2 hover:text-ink">
        <ArrowLeft size={14} aria-hidden /> {t('country.back')}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-4xl" aria-hidden>{country.flag}</span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{pick(country, 'name')}</h1>
          <p className="text-sm text-ink3">
            {lang === 'zh' ? country.nameEn : country.nameZh} · {pick(regions[country.region], 'name')}
          </p>
        </div>
        <Link
          to={compareTarget}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
        >
          <ArrowLeftRight size={15} aria-hidden />
          {t('country.compareWithMe')}
        </Link>
      </div>

      <p className="text-sm leading-relaxed text-ink2">{pick(country, 'note')}</p>

      <section aria-labelledby="profile">
        <h2 id="profile" className="mb-2 text-lg font-semibold">{t('country.profile')}</h2>
        <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
          <CultureMapChart a={country} />
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <TipList title={t('compare.workTips')} icon={Briefcase} tips={pick(country, 'workTips')} />
        <TipList title={t('compare.travelTips')} icon={Plane} tips={pick(country, 'travelTips')} />
      </div>
    </div>
  )
}
