#!/usr/bin/env node
// Copies the shared dataset + advice engine from the web app (repo root src/)
// into mobile/src/shared/. The root files are the single source of truth —
// edit those, then re-run `npm run sync` (also runs automatically on start).
const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..', '..')
const outDir = path.resolve(__dirname, '..', 'src', 'shared')

const FILES = [
  ['src/data/countries.js', 'countries.js'],
  ['src/data/dimensions.js', 'dimensions.js'],
  ['src/lib/advice.js', 'advice.js'],
  ['src/i18n/translations.js', 'translations.js'],
]

fs.mkdirSync(outDir, { recursive: true })
for (const [from, to] of FILES) {
  const src = path.join(repoRoot, from)
  const content =
    `// AUTO-SYNCED from ${from} — do not edit here; run \`npm run sync\` in mobile/.\n` +
    fs.readFileSync(src, 'utf8')
  fs.writeFileSync(path.join(outDir, to), content)
  console.log(`synced ${from} -> src/shared/${to}`)
}
