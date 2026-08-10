// AUTO-SYNCED from src/lib/advice.js — do not edit here; run `npm run sync` in mobile/.
// Gap engine: turns the score distance between two cultures on one dimension
// into a severity level and the matching advice branch.

export const GAP_LARGE = 25
export const GAP_MODERATE = 12

export function gapLevel(gap) {
  const a = Math.abs(gap)
  if (a >= GAP_LARGE) return 'large'
  if (a >= GAP_MODERATE) return 'moderate'
  return 'aligned'
}

// gap = theirScore - myScore. Positive: counterpart sits closer to the 100 pole.
export function adviceBranch(dimension, gap) {
  const level = gapLevel(gap)
  if (level === 'aligned') return dimension.advice.aligned
  return gap > 0 ? dimension.advice.towardHigh : dimension.advice.towardLow
}

// Returns dimensions annotated with both scores + gap, sorted by |gap| descending.
export function rankDimensions(dimensions, myCountry, theirCountry) {
  return dimensions
    .map((dim) => {
      const my = myCountry.scores[dim.id]
      const their = theirCountry.scores[dim.id]
      const gap = their - my
      return { dim, my, their, gap, level: gapLevel(gap) }
    })
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
}
