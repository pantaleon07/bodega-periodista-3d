import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // rutas relativas → el build funciona en la raíz de un dominio O en una
  // subcarpeta (NAS/Apache/nginx, GitHub Pages, etc.) sin reconfigurar.
  base: './',
})
