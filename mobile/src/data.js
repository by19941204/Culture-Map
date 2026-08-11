// Single import point for the shared dataset and advice engine. The files in
// ./shared are auto-copied from the web app's src/ (single source of truth)
// by scripts/sync-shared.js — run `npm run sync` after editing the originals.
export { countries, regions, regionOrder } from './shared/countries.js'
export { dimensions } from './shared/dimensions.js'
export { GAP_LARGE, GAP_MODERATE, gapLevel, adviceBranch, overallDistance, rankDimensions } from './shared/advice.js'
export { translations } from './shared/translations.js'
