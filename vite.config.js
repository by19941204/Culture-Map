import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves from /culture-map/; root-domain hosts (e.g. Railway)
  // build with DEPLOY_BASE=/
  base: process.env.DEPLOY_BASE || '/culture-map/',
})
