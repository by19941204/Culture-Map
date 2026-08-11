import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves from /Culture-Map/ (must match the repo name exactly);
  // root-domain hosts (e.g. Railway) build with DEPLOY_BASE=/
  base: process.env.DEPLOY_BASE || '/Culture-Map/',
})
