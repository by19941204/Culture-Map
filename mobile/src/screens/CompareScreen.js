import { useEffect, useMemo, useState } from 'react'
import { LayoutAnimation, Modal, Platform, Pressable, Share, StyleSheet, Text, UIManager, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Bullet, Card, Screen, SectionTitle } from '../ui'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { adviceBranch, countries, dimensions, overallDistance, rankDimensions } from '../data'
import { savePref, usePersistedState } from '../prefs'
import CountryPicker from '../components/CountryPicker'
import CultureMapChart from '../components/CultureMapChart'
import GapBadge from '../components/GapBadge'

const isCode = (v) => countries.some((c) => c.code === v)
const isCtx = (v) => v === 'work' || v === 'travel'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const buzz = () => Haptics.selectionAsync().catch(() => {})
const animateNext = () => {
  try {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  } catch {
    // layout animation is best-effort (unsupported on some web targets)
  }
}

// Tiny two-dot spectrum so a gap's size is visible at a glance.
function MiniSpectrum({ my, their }) {
  const { colors } = useTheme()
  const [w, setW] = useState(0)
  const posX = (v) => w * (0.04 + (Math.max(0, Math.min(100, v)) / 100) * 0.92)
  return (
    <View style={styles.mini} onLayout={(e) => setW(e.nativeEvent.layout.width)} aria-hidden>
      <View style={[styles.miniTrack, { backgroundColor: colors.line }]} />
      {w > 0 && (
        <>
          <View
            style={[
              styles.miniConn,
              {
                backgroundColor: colors.baseline,
                left: Math.min(posX(my), posX(their)),
                width: Math.abs(posX(my) - posX(their)),
              },
            ]}
          />
          <View
            style={[
              styles.miniDot,
              { backgroundColor: colors.me, borderColor: colors.card, left: posX(my) - 4 },
            ]}
          />
          <View
            style={[
              styles.miniDot,
              { backgroundColor: colors.them, borderColor: colors.card, left: posX(their) - 4 },
            ]}
          />
        </>
      )}
    </View>
  )
}

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

  // counterparts compared recently, most recent first (comma-joined codes)
  const [recentStr, setRecentStr] = usePersistedState(
    'cm-recent',
    initialPrefs?.['cm-recent'] ?? '',
  )
  const recordRecent = (code) =>
    setRecentStr((prev) =>
      [code, ...String(prev).split(',').filter((c) => isCode(c) && c !== code)]
        .slice(0, 6)
        .join(','),
    )

  // Other screens can navigate here with { them: code }. Consume-and-clear
  // the param so navigating again with the SAME code still re-applies it.
  const navigation = useNavigation()
  const routeThem = route.params?.them
  useEffect(() => {
    if (routeThem && isCode(routeThem)) {
      setThem(routeThem)
      recordRecent(routeThem)
      navigation.setParams({ them: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeThem, setThem, navigation])

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
  const setOpen = (id, open) => {
    animateNext()
    setOverrides((prev) => ({
      key: pairKey,
      map: { ...(prev.key === pairKey ? prev.map : {}), [id]: open },
    }))
  }

  const topGaps = ranked.filter((r) => r.level !== 'aligned').slice(0, 3)
  const distance = overallDistance(ranked)
  const tips = theirCountry && pick(theirCountry, ctx === 'work' ? 'workTips' : 'travelTips')

  const recent = recentStr.split(',').filter(isCode)
  const chooseThem = (code) => {
    buzz()
    setThem(code)
    recordRecent(code)
  }
  const recentChips = recent.filter((c) => c !== them && c !== me).slice(0, 4)

  // one-time first-launch setup: pick your own culture before anything else
  const [showOnboard, setShowOnboard] = useState(
    () => !initialPrefs?.['cm-me'] && !initialPrefs?.['cm-onboarded'],
  )
  const finishOnboard = () => {
    savePref('cm-onboarded', '1')
    animateNext()
    setShowOnboard(false)
  }

  const shareComparison = async () => {
    const sep = lang === 'zh' ? '：' : ': '
    const lines = [
      `${myCountry.flag} ${pick(myCountry, 'name')} vs ${theirCountry.flag} ${pick(theirCountry, 'name')} · Culture Map`,
      `${t('compare.distance')}${sep}${t(`distance.${distance.level}`)}`,
      ...topGaps.map((r, i) => `#${i + 1} ${pick(r.dim, 'name')} — ${lean(r)}`),
      '',
      ...(ranked.length
        ? adviceBranch(ranked[0].dim, ranked[0].gap)[ctx][lang].slice(0, 2).map((s) => `· ${s}`)
        : []),
      '',
      'https://by19941204.github.io/Culture-Map/',
    ]
    try {
      await Share.share({ message: lines.join('\n') })
    } catch {
      // user dismissed the sheet or share is unavailable
    }
  }

  const lean = (r) => {
    const label = pick(r.dim, r.gap > 0 ? 'highLabel' : 'lowLabel')
    return lang === 'zh'
      ? `${t('compare.theyLean')}「${label}」`
      : `${t('compare.theyLean')} “${label}”`
  }

  return (
    <Screen
      title={t('compare.title')}
      headerExtra={
        !same ? (
          <Pressable
            onPress={shareComparison}
            hitSlop={8}
            style={styles.shareBtn}
            accessibilityRole="button"
            accessibilityLabel={t('compare.share')}
            testID="share"
          >
            <Feather name="share" size={16} color={colors.ink2} />
          </Pressable>
        ) : null
      }
    >
      <Modal visible={showOnboard} animationType="fade" transparent onRequestClose={finishOnboard}>
        <View style={styles.onboardBackdrop} testID="onboarding">
          <Card style={styles.onboardCard}>
            <Text style={[styles.onboardTitle, { color: colors.ink }]}>{t('onboard.title')}</Text>
            <Text style={[styles.body, { color: colors.ink2, marginTop: 6, marginBottom: 16 }]}>
              {t('onboard.subtitle')}
            </Text>
            <CountryPicker value={me} onChange={setMe} label={t('compare.me')} colorKey="me" />
            <Pressable
              onPress={finishOnboard}
              accessibilityRole="button"
              testID="onboarding-done"
              style={[styles.onboardBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.onboardBtnText}>{t('onboard.done')}</Text>
            </Pressable>
          </Card>
        </View>
      </Modal>
      {/* selectors + scenario */}
      <Card>
        {/* "me" is set once — keep it compact; the counterpart is the
            everyday choice and gets the prominent picker */}
        <View style={styles.meRow}>
          <CountryPicker value={me} onChange={setMe} label={t('compare.me')} colorKey="me" compact />
          <Pressable
            onPress={() => {
              const a = me
              setMe(them)
              chooseThem(a)
            }}
            accessibilityRole="button"
            accessibilityLabel={t('compare.swap')}
            testID="swap"
            style={[styles.swapBtn, { borderColor: colors.line }]}
          >
            <Feather name="repeat" size={14} color={colors.ink2} />
          </Pressable>
        </View>
        <CountryPicker value={them} onChange={chooseThem} label={t('compare.them')} colorKey="them" />

        {recentChips.length > 0 && (
          <View style={styles.recentRow}>
            <Feather name="clock" size={12} color={colors.ink3} />
            <Text style={[styles.recentLabel, { color: colors.ink3 }]}>{t('compare.recent')}</Text>
            {recentChips.map((code) => {
              const c = countries.find((x) => x.code === code)
              return (
                <Pressable
                  key={code}
                  onPress={() => chooseThem(code)}
                  accessibilityRole="button"
                  testID={`recent-${code}`}
                  style={[styles.recentChip, { borderColor: colors.line }]}
                >
                  <Text style={[styles.recentChipText, { color: colors.ink2 }]}>
                    {c.flag} {pick(c, 'name')}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}

        <View style={[styles.segment, { backgroundColor: colors.page, borderColor: colors.line }]}>
          {[
            { id: 'work', icon: 'briefcase', key: 'context.work' },
            { id: 'travel', icon: 'send', key: 'context.travel' },
          ].map(({ id, icon, key }) => {
            const active = ctx === id
            return (
              <Pressable
                key={id}
                onPress={() => {
                  buzz()
                  setCtx(id)
                }}
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
          {/* the one-glance verdict first, details after */}
          <Card testID="distance-card">
            <View style={styles.distanceRow}>
              <Text style={[styles.caption, { color: colors.ink2 }]}>{t('compare.distance')}</Text>
              <Text style={[styles.distanceLevel, { color: colors.ink }]}>
                {t(`distance.${distance.level}`)}
              </Text>
            </View>
            <View style={[styles.distanceTrack, { backgroundColor: colors.line }]}>
              <View
                style={[
                  styles.distanceFill,
                  {
                    backgroundColor: colors.accent,
                    width: `${Math.min(100, (distance.avg / 40) * 100)}%`,
                  },
                ]}
              />
            </View>
            {topGaps.length > 0 && (
              <Text style={[styles.caption, { color: colors.ink3, marginTop: 8 }]}>
                {t('compare.focusOn')}
                {lang === 'zh' ? '：' : ': '}
                {topGaps
                  .slice(0, 2)
                  .map((r) => pick(r.dim, 'name'))
                  .join(lang === 'zh' ? '、' : ', ')}
              </Text>
            )}
          </Card>

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
                  testID={`topgap-${r.dim.id}`}
                >
                  <Card>
                    <Text style={[styles.caption, { color: colors.ink3 }]}>#{i + 1}</Text>
                    <Text style={[styles.topGapName, { color: colors.ink }]}>
                      {pick(r.dim, 'name')}
                    </Text>
                    <Text style={[styles.body, { color: colors.ink2 }]}>{lean(r)}</Text>
                    <MiniSpectrum my={r.my} their={r.their} />
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

  meRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  recentLabel: { fontSize: 12 },
  recentChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recentChipText: { fontSize: 12 },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  distanceLevel: { fontSize: 14, fontWeight: '600' },
  distanceTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  distanceFill: { height: '100%', borderRadius: 3 },

  shareBtn: { padding: 8 },

  onboardBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  onboardCard: { padding: 20 },
  onboardTitle: { fontSize: 20, fontWeight: '700' },
  onboardBtn: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  onboardBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },

  mini: { height: 12, marginTop: 10, justifyContent: 'center' },
  miniTrack: { height: 1, borderRadius: 1 },
  miniConn: { position: 'absolute', top: 5, height: 2, borderRadius: 1 },
  miniDot: {
    position: 'absolute',
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
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
