import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use root in dev so local server works at http://localhost:5173/
  // and use GitHub Pages base in production builds/deploys
  base: mode === 'production' ? '/QR_React/' : '/',
}))
