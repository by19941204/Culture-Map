import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import { Bullet, Card, Screen, SectionTitle } from '../ui'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { adviceBranch, countries, dimensions, rankDimensions } from '../data'
import { usePersistedState } from '../prefs'
import CountryPicker from '../components/CountryPicker'
import CultureMapChart from '../components/CultureMapChart'
import GapBadge from '../components/GapBadge'

const isCode = (v) => countries.some((c) => c.code === v)
const isCtx = (v) => v === 'work' || v === 'travel'

function AdviceCard({ entry, ctx, expanded, onToggle, holisticApplies }) {
  const { colors } = useTheme()
  const { lang, pick, t } = useLang()
  const branch = adviceBranch(entry.dim, entry.gap)
  const items = branch[ctx][lang]
  const holisticNote = holisticApplies ? pick(entry.dim, 'holisticNote') : null
  const leanLabel =
    entry.level === 'aligned'
      ? null
      : pick(entry.dim, entry.gap > 0 ? 'highLabel' : 'lowLabel')

  return (
    <Card style={styles.adviceCard}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={pick(entry.dim, 'name')}
        testID={`advice-${entry.dim.id}`}
        style={styles.adviceHeader}
      >
        <View style={styles.adviceHeaderText}>
          <Text style={[styles.adviceName, { color: colors.ink }]}>
            {pick(entry.dim, 'name')}
          </Text>
          {leanLabel ? (
            <Text style={[styles.caption, { color: colors.ink2 }]}>
              {lang === 'zh'
                ? `${t('compare.theyLean')}「${leanLabel}」`
                : `${t('compare.theyLean')} “${leanLabel}”`}
            </Text>
          ) : null}
        </View>
        <GapBadge gap={entry.gap} />
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.ink3}
        />
      </Pressable>

      {expanded ? (
        <View style={[styles.adviceBody, { borderTopColor: colors.line }]}>
          <View style={styles.bulletList}>
            {items.map((item, i) => (
              <Bullet key={i}>{item}</Bullet>
            ))}
          </View>
          {holisticNote ? (
            <View style={[styles.holisticBox, { backgroundColor: colors.page }]}>
              <Feather name="zap" size={14} color={colors.accent} style={styles.holisticIcon} />
              <Text style={[styles.holisticText, { color: colors.ink2 }]}>
                <Text style={styles.bold}>
                  {t('compare.holistic')}
                  {lang === 'zh' ? '：' : ': '}
                </Text>
                {holisticNote}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  )
}

export default function CompareScreen() {
  const { colors } = useTheme()
  const { lang, pick, t } = useLang()
  const route = useRoute()
  const initialPrefs = route.params?.initialPrefs

  const [me, setMe] = usePersistedState(
    'cm-me',
    initialPrefs?.['cm-me'] && isCode(initialPrefs['cm-me']) ? initialPrefs['cm-me'] : 'CN',
    isCode,
  )
  const [them, setThem] = usePersistedState(
    'cm-them',
    initialPrefs?.['cm-them'] && isCode(initialPrefs['cm-them']) ? initialPrefs['cm-them'] : 'US',
    isCode,
  )
  const [ctx, setCtx] = usePersistedState(
    'cm-context',
    initialPrefs?.['cm-context'] && isCtx(initialPrefs['cm-context'])
      ? initialPrefs['cm-context']
      : 'work',
    isCtx,
  )

  // Other screens can navigate here with { them: code }.
  const routeThem = route.params?.them
  useEffect(() => {
    if (routeThem && isCode(routeThem)) setThem(routeThem)
  }, [routeThem, setThem])

  // Per-pairing user overrides on top of the "top 3 gaps start expanded"
  // default, so switching countries resets the accordion without an effect.
  const [overrides, setOverrides] = useState({ key: '', map: {} })

  const myCountry = countries.find((c) => c.code === me)
  const theirCountry = countries.find((c) => c.code === them)
  const same = me === them

  const ranked = useMemo(
    () => (same ? [] : rankDimensions(dimensions, myCountry, theirCountry)),
    [same, myCountry, theirCountry],
  )

  const pairKey = `${me}|${them}`
  const defaultOpen = new Set(ranked.slice(0, 3).map((r) => r.dim.id))
  const isExpanded = (id) =>
    overrides.key === pairKey && id in overrides.map ? overrides.map[id] : defaultOpen.has(id)
  const setOpen = (id, open) =>
    setOverrides((prev) => ({
      key: pairKey,
      map: { ...(prev.key === pairKey ? prev.map : {}), [id]: open },
    }))

  const topGaps = ranked.filter((r) => r.level !== 'aligned').slice(0, 3)
  const tips = theirCountry && pick(theirCountry, ctx === 'work' ? 'workTips' : 'travelTips')

  const lean = (r) => {
    const label = pick(r.dim, r.gap > 0 ? 'highLabel' : 'lowLabel')
    return lang === 'zh'
      ? `${t('compare.theyLean')}「${label}」`
      : `${t('compare.theyLean')} “${label}”`
  }

  return (
    <Screen title={t('compare.title')}>
      {/* selectors + scenario */}
      <Card>
        <CountryPicker value={me} onChange={setMe} label={t('compare.me')} colorKey="me" />
        <Pressable
          onPress={() => {
            const a = me
            const b = them
            setMe(b)
            setThem(a)
          }}
          accessibilityRole="button"
          accessibilityLabel={t('compare.swap')}
          testID="swap"
          style={[styles.swapBtn, { borderColor: colors.line }]}
        >
          <Feather name="repeat" size={16} color={colors.ink2} />
        </Pressable>
        <CountryPicker value={them} onChange={setThem} label={t('compare.them')} colorKey="them" />

        <View style={[styles.segment, { backgroundColor: colors.page, borderColor: colors.line }]}>
          {[
            { id: 'work', icon: 'briefcase', key: 'context.work' },
            { id: 'travel', icon: 'send', key: 'context.travel' },
          ].map(({ id, icon, key }) => {
            const active = ctx === id
            return (
              <Pressable
                key={id}
                onPress={() => setCtx(id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(key)}
                testID={`ctx-${id}`}
                style={[styles.segmentBtn, active && { backgroundColor: colors.card }]}
              >
                <Feather name={icon} size={15} color={active ? colors.accent : colors.ink2} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.accent : colors.ink2 },
                    active && styles.bold,
                  ]}
                >
                  {t(key)}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Card>

      {same ? (
        <Card>
          <Text style={[styles.body, { color: colors.ink2 }]}>{t('compare.same')}</Text>
        </Card>
      ) : (
        <>
          {/* biggest gaps, at a glance */}
          <SectionTitle>{t('compare.topGaps')}</SectionTitle>
          {topGaps.length === 0 ? (
            <Card>
              <Text style={[styles.body, { color: colors.ink2 }]}>{t('compare.noGaps')}</Text>
            </Card>
          ) : (
            <View style={styles.stack}>
              {topGaps.map((r, i) => (
                <Pressable
                  key={r.dim.id}
                  onPress={() => setOpen(r.dim.id, true)}
                  accessibilityRole="button"
                  accessibilityLabel={pick(r.dim, 'name')}
                  testID={`topgap-${r.dim.id}`}
                >
                  <Card>
                    <Text style={[styles.caption, { color: colors.ink3 }]}>#{i + 1}</Text>
                    <Text style={[styles.topGapName, { color: colors.ink }]}>
                      {pick(r.dim, 'name')}
                    </Text>
                    <Text style={[styles.body, { color: colors.ink2 }]}>{lean(r)}</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}

          {/* the map itself */}
          <SectionTitle>{t('compare.map')}</SectionTitle>
          <Card>
            <CultureMapChart a={myCountry} b={theirCountry} />
          </Card>

          {/* advice, largest gap first */}
          <SectionTitle hint={t('compare.adviceHint')}>{t('compare.advice')}</SectionTitle>
          <View style={styles.stack}>
            {ranked.map((r) => (
              <AdviceCard
                key={r.dim.id}
                entry={r}
                ctx={ctx}
                expanded={isExpanded(r.dim.id)}
                onToggle={() => setOpen(r.dim.id, !isExpanded(r.dim.id))}
                holisticApplies={r.dim.id === 'persuading' && theirCountry.holistic}
              />
            ))}
          </View>
        </>
      )}

      {/* counterpart quick guide */}
      {theirCountry ? (
        <>
          <SectionTitle>
            {`${t('compare.aboutThem')}${pick(theirCountry, 'name')} ${theirCountry.flag}`}
          </SectionTitle>
          <Card>
            <Text style={[styles.body, { color: colors.ink2 }]}>
              {pick(theirCountry, 'note')}
            </Text>
            <Text style={[styles.tipsHeading, { color: colors.ink }]}>
              {t(ctx === 'work' ? 'compare.workTips' : 'compare.travelTips')}
            </Text>
            <View style={styles.bulletList}>
              {(tips || []).map((tip, i) => (
                <Bullet key={i} color={colors.them}>
                  {tip}
                </Bullet>
              ))}
            </View>
          </Card>
        </>
      ) : null}

      {/* footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.ink3 }]}>{t('footer.disclaimer')}</Text>
        <Text style={[styles.footerText, { color: colors.ink3 }]}>{t('footer.credit')}</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12 },
  bold: { fontWeight: '600' },
  stack: { gap: 8 },
  bulletList: { gap: 8 },

  swapBtn: {
    alignSelf: 'center',
    marginVertical: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segment: {
    flexDirection: 'row',
    marginTop: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9,
    paddingHorizontal: 12,
  },
  segmentText: { fontSize: 14 },

  topGapName: { fontSize: 14, lineHeight: 21, fontWeight: '600', marginTop: 2, marginBottom: 4 },

  adviceCard: { padding: 0, overflow: 'hidden' },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  adviceHeaderText: { flex: 1, minWidth: 0 },
  adviceName: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  adviceBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  holisticBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  holisticIcon: { marginTop: 2 },
  holisticText: { flex: 1, fontSize: 12, lineHeight: 18 },

  tipsHeading: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },

  footer: { gap: 6, marginTop: -4 },
  footerText: { fontSize: 11, lineHeight: 16 },
})
