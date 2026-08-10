import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { gapLevel } from '../data'

// Severity badge for one dimension's score gap. Aligned renders as a plain
// muted caption; moderate/large as a hairline pill, large in bolder ink.
export default function GapBadge({ gap }) {
  const { colors } = useTheme()
  const { t } = useLang()
  const level = gapLevel(gap)

  if (level === 'aligned') {
    return (
      <Text style={[styles.aligned, { color: colors.ink3 }]} numberOfLines={1}>
        {t('gap.aligned')}
      </Text>
    )
  }

  const large = level === 'large'
  return (
    <View style={[styles.pill, { borderColor: colors.line }]}>
      <Text
        style={[
          styles.pillText,
          { color: large ? colors.ink : colors.ink2, fontWeight: large ? '600' : '400' },
        ]}
        numberOfLines={1}
      >
        {t('gap.label')} {Math.abs(gap)} · {t(`gap.${level}`)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  aligned: {
    fontSize: 12,
    flexShrink: 0,
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
  },
  pillText: {
    fontSize: 12,
  },
})
