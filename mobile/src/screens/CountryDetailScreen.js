import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Screen, Card, SectionTitle, Bullet } from '../ui'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { countries, regions } from '../data'
import CultureMapChart from '../components/CultureMapChart'

function BackLink() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLang()
  return (
    <Pressable
      onPress={() =>
        navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Countries')
      }
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('country.back')}
      testID="back"
      style={styles.backBtn}
    >
      <Feather name="arrow-left" size={15} color={colors.ink2} />
      <Text style={[styles.backText, { color: colors.ink2 }]}>{t('country.back')}</Text>
    </Pressable>
  )
}

function TipsCard({ titleKey, icon, tips, testID }) {
  const { colors } = useTheme()
  const { t } = useLang()
  return (
    <Card testID={testID}>
      <View style={styles.tipsTitleRow}>
        <Feather name={icon} size={15} color={colors.accent} />
        <Text style={[styles.tipsTitle, { color: colors.ink }]}>{t(titleKey)}</Text>
      </View>
      <View style={styles.tipsList}>
        {(tips || []).map((tip, i) => (
          <Bullet key={i}>{tip}</Bullet>
        ))}
      </View>
    </Card>
  )
}

export default function CountryDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors } = useTheme()
  const { lang, t, pick } = useLang()

  const code = route.params?.code
  const country = countries.find((c) => c.code === String(code || '').toUpperCase())

  if (!country) {
    return (
      <Screen title={t('nav.countries')}>
        <BackLink />
        <Text style={[styles.paragraph, { color: colors.ink2 }]}>
          {t('country.notFound')}
        </Text>
      </Screen>
    )
  }

  return (
    <Screen title={pick(country, 'name')}>
      <BackLink />

      <View style={styles.headerRow} testID="country-header">
        <Text style={styles.flag} accessibilityElementsHidden>
          {country.flag}
        </Text>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.ink }]}>{pick(country, 'name')}</Text>
          <Text style={[styles.caption, { color: colors.ink3 }]}>
            {lang === 'zh' ? country.nameEn : country.nameZh} ·{' '}
            {pick(regions[country.region], 'name')}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate('CompareTab', { them: country.code })}
        accessibilityRole="button"
        accessibilityLabel={t('country.compareWithMe')}
        testID="compare-with-me"
        style={({ pressed }) => [
          styles.compareBtn,
          { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Feather name="repeat" size={15} color={colors.page} />
        <Text style={[styles.compareText, { color: colors.page }]}>
          {t('country.compareWithMe')}
        </Text>
      </Pressable>

      <Text style={[styles.paragraph, { color: colors.ink2 }]}>
        {pick(country, 'note')}
      </Text>

      <SectionTitle>{t('country.profile')}</SectionTitle>
      <Card>
        <CultureMapChart a={country} />
      </Card>

      <TipsCard
        titleKey="compare.workTips"
        icon="briefcase"
        tips={pick(country, 'workTips')}
        testID="work-tips"
      />
      <TipsCard
        titleKey="compare.travelTips"
        icon="send"
        tips={pick(country, 'travelTips')}
        testID="travel-tips"
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minHeight: 32,
    marginBottom: -4,
  },
  backText: { fontSize: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flag: { fontSize: 40 },
  headerText: { flex: 1, gap: 2 },
  name: { fontSize: 24, fontWeight: '700' },
  caption: { fontSize: 12 },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compareText: { fontSize: 15, fontWeight: '600' },
  paragraph: { fontSize: 14, lineHeight: 21 },
  tipsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tipsTitle: { fontSize: 15, fontWeight: '600' },
  tipsList: { gap: 6 },
})
