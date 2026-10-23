import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas: el mismo build funciona en GitHub Pages (/rumbo/) y en local.
  base: './',
  server: {
    host: true,
  },
})
