import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme'
import { useLang } from '../i18n'
import { dimensions, gapLevel } from '../data'
import GapBadge from './GapBadge'

const DOT_SIZE = 16 // 12px colored core + 2px card-colored ring on each side
const TRACK_HEIGHT = 28

// Fraction of the track width for a 0-100 score, clamped to 2%..98% so a dot
// never bleeds past the track ends.
const frac = (v) => 0.02 + (Math.max(0, Math.min(100, v)) / 100) * 0.96

function LegendItem({ color, country, pick, testID }) {
  const { colors } = useTheme()
  return (
    <View style={styles.legendItem} testID={testID}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: colors.ink2 }]} numberOfLines={1}>
        {country.flag} {pick(country, 'name')}
      </Text>
    </View>
  )
}

function Dot({ id, x, nudge, color, label, active, onToggle, hitSlop, testID }) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={() => onToggle(id)}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      testID={testID}
      style={[
        styles.dot,
        {
          backgroundColor: color,
          borderColor: colors.card,
          left: x - DOT_SIZE / 2,
          top: TRACK_HEIGHT / 2 - DOT_SIZE / 2 + nudge,
        },
      ]}
    />
  )
}

function DimensionRow({ dim, a, b }) {
  const { colors } = useTheme()
  const { pick } = useLang()
  const [trackWidth, setTrackWidth] = useState(0)
  const [active, setActive] = useState(null) // 'a' | 'b' | null, per row
  const toggle = (id) => setActive((cur) => (cur === id ? null : id))

  const av = a.scores[dim.id]
  const bv = b ? b.scores[dim.id] : null
  // nudge near-identical dots apart vertically so neither hides the other
  const nudge = b && Math.abs(av - bv) < 4 ? 4 : 0
  const dimName = pick(dim, 'name')
  // big gaps get visual weight so the eye lands on them first
  const heavy = b != null && gapLevel(bv - av) === 'large'

  const ax = trackWidth * frac(av)
  const bx = b ? trackWidth * frac(bv) : 0

  // When the dots sit close together, their expanded touch rects would
  // overlap and the later sibling would steal every tap — so shrink the
  // per-dot slop and let the track itself resolve taps to the nearest dot.
  const close = b != null && Math.abs(ax - bx) < 44
  const dotSlop = close ? 2 : 14
  const onTrackPress = (e) => {
    const { locationX, locationY } = e.nativeEvent
    if (!b) {
      toggle('a')
      return
    }
    const da = Math.abs(locationX - ax)
    const db = Math.abs(locationX - bx)
    if (Math.abs(da - db) < 2 && nudge) {
      // x-tie on vertically nudged dots: the top half belongs to 'a'
      toggle(locationY <= TRACK_HEIGHT / 2 ? 'a' : 'b')
    } else {
      toggle(da <= db ? 'a' : 'b')
    }
  }

  const activeCountry = active === 'a' ? a : active === 'b' ? b : null
  const activeValue = active === 'a' ? av : bv

  return (
    <View style={[styles.row, { borderTopColor: colors.line }]} testID={`map-row-${dim.id}`}>
      <View style={styles.nameRow}>
        <Text
          style={[styles.dimName, { color: colors.ink }, heavy && { fontWeight: '600' }]}
          numberOfLines={1}
        >
          {dimName}
        </Text>
        {b ? <GapBadge gap={bv - av} /> : null}
      </View>

      <Pressable
        style={styles.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        onPress={onTrackPress}
        accessible={false}
      >
        <View style={[styles.trackLine, { backgroundColor: colors.line }]} />
        {trackWidth > 0 ? (
          <>
            {b && av !== bv ? (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: colors.baseline,
                    left: Math.min(ax, bx),
                    width: Math.abs(bx - ax),
                  },
                  heavy && { height: 3 },
                ]}
              />
            ) : null}
            <Dot
              id="a"
              x={ax}
              nudge={-nudge}
              color={colors.me}
              label={`${dimName} — ${pick(a, 'name')}: ${av}/100`}
              active={active === 'a'}
              onToggle={toggle}
              hitSlop={dotSlop}
              testID={`dot-${dim.id}-a`}
            />
            {b ? (
              <Dot
                id="b"
                x={bx}
                nudge={nudge}
                color={colors.them}
                label={`${dimName} — ${pick(b, 'name')}: ${bv}/100`}
                active={active === 'b'}
                onToggle={toggle}
                hitSlop={dotSlop}
                testID={`dot-${dim.id}-b`}
              />
            ) : null}
          </>
        ) : null}
      </Pressable>

      {activeCountry ? (
        <Text style={[styles.readout, { color: colors.ink2 }]} testID={`readout-${dim.id}`}>
          {activeCountry.flag} {pick(activeCountry, 'name')} · {activeValue}/100
        </Text>
      ) : null}

      <View style={styles.polesRow}>
        <Text style={[styles.poleLabel, { color: colors.ink3 }]}>
          ← {pick(dim, 'lowLabel')}
        </Text>
        <Text style={[styles.poleLabel, styles.poleLabelRight, { color: colors.ink3 }]}>
          {pick(dim, 'highLabel')} →
        </Text>
      </View>
    </View>
  )
}

/**
 * The classic culture-map view: 8 horizontal spectra, one dot per culture.
 * `a` is required; `b` is optional (single-country profile mode).
 */
export default function CultureMapChart({ a, b }) {
  const { colors } = useTheme()
  const { t, pick } = useLang()

  return (
    <View testID="culture-map-chart">
      {b ? (
        <View style={styles.legend} testID="chart-legend">
          <LegendItem color={colors.me} country={a} pick={pick} testID="legend-a" />
          <LegendItem color={colors.them} country={b} pick={pick} testID="legend-b" />
          <Text style={[styles.legendHint, { color: colors.ink3 }]} numberOfLines={1}>
            {t('compare.mapHint')}
          </Text>
        </View>
      ) : null}

      {dimensions.map((dim, i) => (
        <View key={dim.id} style={i === 0 ? styles.firstRow : null}>
          <DimensionRow dim={dim} a={a} b={b} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 16,
    rowGap: 4,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 14,
    lineHeight: 21,
  },
  legendHint: {
    fontSize: 11,
    marginLeft: 'auto',
    flexShrink: 1,
  },
  firstRow: {
    marginTop: -1, // hide the very first hairline divider
  },
  row: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  dimName: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  track: {
    height: TRACK_HEIGHT,
    justifyContent: 'center',
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: TRACK_HEIGHT / 2 - StyleSheet.hairlineWidth / 2,
    height: StyleSheet.hairlineWidth,
  },
  connector: {
    position: 'absolute',
    top: TRACK_HEIGHT / 2 - 1,
    height: 2,
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
  readout: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  polesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 2,
  },
  poleLabel: {
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 1,
  },
  poleLabelRight: {
    textAlign: 'right',
  },
})
