import { useMemo, useState } from 'react'
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Screen, Card } from '../ui'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { countries, regions, regionOrder } from '../data'

function CountryRow({ country, onPress }) {
  const { colors } = useTheme()
  const { lang, pick } = useLang()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      testID={`country-${country.code}`}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: pressed ? colors.baseline : colors.line,
        },
      ]}
    >
      <Text style={styles.rowFlag} accessibilityElementsHidden>
        {country.flag}
      </Text>
      <View style={styles.rowBody}>
        <Text style={[styles.rowName, { color: colors.ink }]} numberOfLines={1}>
          {pick(country, 'name')}
        </Text>
        <Text style={[styles.rowCaption, { color: colors.ink3 }]} numberOfLines={1}>
          {lang === 'zh' ? country.nameEn : country.nameZh} ·{' '}
          {pick(regions[country.region], 'name')}
        </Text>
        <Text style={[styles.rowNote, { color: colors.ink2 }]} numberOfLines={2}>
          {pick(country, 'note')}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.ink3} />
    </Pressable>
  )
}

export default function CountriesScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t, pick } = useLang()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return countries.filter(
      (c) =>
        (region === 'all' || c.region === region) &&
        (!q ||
          c.nameZh.includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)),
    )
  }, [query, region])

  return (
    <Screen title={t('countries.title')} scroll={false}>
      <View style={styles.controls}>
        <Text style={[styles.subtitle, { color: colors.ink2 }]}>
          {t('countries.subtitle')}
        </Text>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <Feather name="search" size={15} color={colors.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('countries.search')}
            placeholderTextColor={colors.ink3}
            style={[styles.searchInput, { color: colors.ink }]}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            accessibilityLabel={t('countries.search')}
            testID="countries-search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
          testID="countries-region-chips"
        >
          {['all', ...regionOrder].map((r) => {
            const active = region === r
            const label = r === 'all' ? t('countries.all') : pick(regions[r], 'name')
            return (
              <Pressable
                key={r}
                onPress={() => setRegion(r)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                testID={`chip-${r}`}
                style={[
                  styles.chip,
                  { borderColor: active ? colors.accent : colors.line },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active
                      ? { color: colors.accent, fontWeight: '600' }
                      : { color: colors.ink2 },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.code}
        renderItem={({ item }) => (
          <CountryRow
            country={item}
            onPress={() => navigation.navigate('CountryDetail', { code: item.code })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Card>
            <Text style={[styles.emptyText, { color: colors.ink2 }]}>
              {t('countries.empty')}
            </Text>
          </Card>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.list}
        testID="countries-list"
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  controls: { gap: 12 },
  subtitle: { fontSize: 12, lineHeight: 17 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 10 },
  chipRow: { gap: 8, paddingRight: 16 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 32,
    justifyContent: 'center',
  },
  chipText: { fontSize: 12 },
  list: { flex: 1, marginHorizontal: -16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  separator: { height: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 12,
    minHeight: 44,
  },
  rowFlag: { fontSize: 30 },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '600' },
  rowCaption: { fontSize: 11 },
  rowNote: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  emptyText: { fontSize: 14, lineHeight: 21 },
})
