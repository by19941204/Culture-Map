import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Screen, Card, Bullet } from '../ui'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { dimensions } from '../data'

function Pole({ heading, label, behaviors }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.pole, { backgroundColor: colors.page }]}>
      <Text style={[styles.poleHeading, { color: colors.ink3 }]}>{heading}</Text>
      <Text style={[styles.poleLabel, { color: colors.ink }]}>{label}</Text>
      <View style={styles.poleList}>
        {behaviors.map((b, i) => (
          <Bullet key={i} color={colors.baseline}>
            {b}
          </Bullet>
        ))}
      </View>
    </View>
  )
}

export default function DimensionsScreen() {
  const { colors } = useTheme()
  const { lang, t, pick } = useLang()

  return (
    <Screen title={t('dimensions.title')}>
      <Text style={[styles.subtitle, { color: colors.ink2 }]} testID="dimensions-subtitle">
        {t('dimensions.subtitle')}
      </Text>

      {dimensions.map((dim, i) => (
        <Card key={dim.id} testID={`dim-card-${dim.id}`}>
          <View style={styles.titleRow}>
            <Text style={[styles.number, { color: colors.ink3 }]}>
              {String(i + 1).padStart(2, '0')}
            </Text>
            <Text style={[styles.name, { color: colors.ink }]}>{pick(dim, 'name')}</Text>
          </View>
          <Text style={[styles.tagline, { color: colors.ink3 }]}>{pick(dim, 'tagline')}</Text>
          <Text style={[styles.desc, { color: colors.ink2 }]}>{pick(dim, 'desc')}</Text>

          <View style={styles.poles}>
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
          </View>

          {dim.holisticNoteZh ? (
            <View style={[styles.holistic, { backgroundColor: colors.page }]}>
              <Feather name="info" size={14} color={colors.accent} style={styles.holisticIcon} />
              <Text style={[styles.holisticText, { color: colors.ink2 }]}>
                <Text style={styles.holisticLead}>
                  {t('compare.holistic')}
                  {lang === 'zh' ? '：' : ': '}
                </Text>
                {pick(dim, 'holisticNote')}
              </Text>
            </View>
          ) : null}
        </Card>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 12, lineHeight: 17, marginBottom: -4 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  number: { fontSize: 12, fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  tagline: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  desc: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  poles: { marginTop: 12, gap: 12 },
  pole: { borderRadius: 12, padding: 12 },
  poleHeading: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  poleLabel: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  poleList: { marginTop: 8, gap: 6 },
  holistic: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  holisticIcon: { marginTop: 2 },
  holisticText: { flex: 1, fontSize: 12, lineHeight: 18 },
  holisticLead: { fontWeight: '600' },
})
