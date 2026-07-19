const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// The bilingual dataset and advice engine live in the web app's src/ at the
// repo root — watch it so both apps share one source of truth.
config.watchFolders = [path.resolve(__dirname, '..')]

module.exports = config
