import { useLang } from '../i18n/LanguageContext'
import { gapLevel } from '../lib/advice'

export default function GapBadge({ gap }) {
  const { t } = useLang()
  const level = gapLevel(gap)
  if (level === 'aligned') {
    return <span className="shrink-0 text-xs text-ink3">{t('gap.aligned')}</span>
  }
  return (
    <span
      className={`shrink-0 rounded-full border border-line px-2 py-0.5 text-xs ${
        level === 'large' ? 'font-semibold text-ink' : 'text-ink2'
      }`}
    >
      {t('gap.label')} {Math.abs(gap)} · {t(`gap.${level}`)}
    </span>
  )
}
