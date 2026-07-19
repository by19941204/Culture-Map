import { useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { countries, regions, regionOrder } from '../data'

// Country selector: a labeled trigger that opens a full-height sheet with
// search + a region-grouped list. Mirrors the web CountrySelect combobox.
// Props: { value, onChange, label, colorKey: 'me'|'them' }
export default function CountryPicker({ value, onChange, label, colorKey }) {
  const { colors } = useTheme()
  const { lang, t, pick } = useLang()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = countries.find((c) => c.code === value)
  const dotColor = colors[colorKey]

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (c) =>
      !q ||
      c.nameZh.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    return regionOrder
      .map((r) => ({ region: r, data: countries.filter((c) => c.region === r && match(c)) }))
      .filter((s) => s.data.length > 0)
  }, [query])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const choose = (code) => {
    onChange(code)
    close()
  }

  const otherName = (c) => (lang === 'zh' ? c.nameEn : c.nameZh)

  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <View style={[styles.labelDot, { backgroundColor: dotColor }]} />
        <Text style={[styles.labelText, { color: colors.ink2 }]} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected ? pick(selected, 'name') : t('select.placeholder')}`}
        testID={`picker-${colorKey}`}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.card,
            borderColor: pressed ? colors.baseline : colors.line,
          },
        ]}
      >
        {selected ? (
          <>
            <Text style={styles.flag}>{selected.flag}</Text>
            <Text style={[styles.triggerName, { color: colors.ink }]} numberOfLines={1}>
              {pick(selected, 'name')}
            </Text>
            <Text style={[styles.triggerOther, { color: colors.ink3 }]} numberOfLines={1}>
              {otherName(selected)}
            </Text>
          </>
        ) : (
          <Text style={[styles.triggerName, { color: colors.ink3, fontWeight: '400' }]} numberOfLines={1}>
            {t('select.placeholder')}
          </Text>
        )}
        <Feather name="chevron-down" size={16} color={colors.ink3} style={styles.chevron} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <View style={[styles.sheet, { backgroundColor: colors.page }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: colors.line }]}>
            <View style={[styles.labelDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.sheetTitle, { color: colors.ink }]} numberOfLines={1}>
              {label}
            </Text>
            <Pressable
              onPress={close}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={lang === 'zh' ? '关闭' : 'Close'}
              testID="picker-close"
              style={styles.closeBtn}
            >
              <Feather name="x" size={20} color={colors.ink2} />
            </Pressable>
          </View>

          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Feather name="search" size={15} color={colors.ink3} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={t('countries.search')}
              placeholderTextColor={colors.ink3}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
              testID="picker-search"
              style={[styles.searchInput, { color: colors.ink }]}
            />
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.listContent}
            testID="picker-list"
            renderSectionHeader={({ section }) => (
              <Text style={[styles.sectionHeader, { color: colors.ink3 }]}>
                {pick(regions[section.region], 'name')}
              </Text>
            )}
            renderItem={({ item }) => {
              const isSelected = item.code === value
              return (
                <Pressable
                  onPress={() => choose(item.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={pick(item, 'name')}
                  testID={`picker-row-${item.code}`}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && { backgroundColor: colors.card },
                  ]}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.rowName,
                      { color: isSelected ? colors.accent : colors.ink },
                      isSelected && styles.rowNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {pick(item, 'name')}
                  </Text>
                  <Text style={[styles.rowOther, { color: colors.ink3 }]} numberOfLines={1}>
                    {otherName(item)}
                  </Text>
                  {isSelected ? (
                    <Feather name="check" size={16} color={colors.accent} />
                  ) : null}
                </Pressable>
              )
            }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.ink3 }]}>
                {t('countries.empty')}
              </Text>
            }
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, minWidth: 0 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  labelDot: { width: 10, height: 10, borderRadius: 5 },
  labelText: { fontSize: 12, fontWeight: '500', flexShrink: 1 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  flag: { fontSize: 20 },
  triggerName: { fontSize: 14, fontWeight: '500', flexShrink: 1 },
  triggerOther: { fontSize: 11, flexShrink: 1 },
  chevron: { marginLeft: 'auto' },
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 10 },
  listContent: { paddingBottom: 32 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  rowName: { fontSize: 14, flexShrink: 1 },
  rowNameSelected: { fontWeight: '600' },
  rowOther: { fontSize: 11, marginLeft: 'auto' },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
})
