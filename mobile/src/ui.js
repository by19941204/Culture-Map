import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from './theme'
import { useLang } from './i18n'

// Standard screen chrome: safe area, header with title + language/theme
// toggles, scrollable body with consistent padding.
export function Screen({ title, children, scroll = true, headerExtra = null }) {
  const { colors, dark, toggleTheme } = useTheme()
  const { lang, toggleLang } = useLang()

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.body}
      keyboardShouldPersistTaps="handled"
      testID="screen-scroll"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, { flex: 1 }]}>{children}</View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.line }]}>
        <Text style={[styles.headerTitle, { color: colors.ink }]} numberOfLines={1}>
          {title}
        </Text>
        {headerExtra}
        <Pressable
          onPress={toggleLang}
          hitSlop={8}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          testID="toggle-lang"
        >
          <Feather name="globe" size={15} color={colors.ink2} />
          <Text style={{ color: colors.ink2, fontSize: 13, marginLeft: 3 }}>
            {lang === 'zh' ? 'EN' : '中'}
          </Text>
        </Pressable>
        <Pressable
          onPress={toggleTheme}
          hitSlop={8}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel={dark ? 'Light mode' : 'Dark mode'}
          testID="toggle-theme"
        >
          <Feather name={dark ? 'sun' : 'moon'} size={16} color={colors.ink2} />
        </Pressable>
      </View>
      {body}
    </SafeAreaView>
  )
}

export function Card({ children, style }) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        { backgroundColor: colors.card, borderColor: colors.line },
        styles.card,
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function SectionTitle({ children, hint }) {
  const { colors } = useTheme()
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{children}</Text>
      {hint ? <Text style={{ color: colors.ink3, fontSize: 11 }}>{hint}</Text> : null}
    </View>
  )
}

// A bullet row: small colored dot + text, used for advice and tip lists.
export function Bullet({ children, color }) {
  const { colors } = useTheme()
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: color || colors.accent }]} />
      <Text style={[styles.bulletText, { color: colors.ink2 }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  body: { padding: 16, paddingBottom: 32, gap: 16 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: -6 },
  sectionTitle: { fontSize: 17, fontWeight: '600' },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 21 },
})
