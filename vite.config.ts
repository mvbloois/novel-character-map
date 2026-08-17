import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from https://<user>.github.io/<repo>/,
// so the production build needs that sub-path as its base. Dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/novel-character-map/' : '/',
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
  },
}))
