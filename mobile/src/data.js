// Single import point for the shared dataset and advice engine, which live in
// the web app's source tree (metro.config.js watches the repo root for this).
export { countries, regions, regionOrder } from '../../src/data/countries.js'
export { dimensions } from '../../src/data/dimensions.js'
export { GAP_LARGE, GAP_MODERATE, gapLevel, adviceBranch, rankDimensions } from '../../src/lib/advice.js'
export { translations } from '../../src/i18n/translations.js'
