import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// Proxy de desarrollo: el navegador habla solo con el servidor de Vite
// (mismo origen), así la cookie de sesión `SameSite=Lax` y el CSRF funcionan
// sin depender de CORS. `/api` es un prefijo exclusivo del proxy: la API no lo
// tiene, y sin él chocarían rutas del SPA y de la API (ej. `/admin/...`).
// API_PROXY_TARGET no lleva prefijo VITE_ para que no termine en el bundle.
// Sin `changeOrigin`: el backend ve Host = Origin y no trata la petición
// como CORS. Ver docs/frontend/api-contracts 23-10-2026/frontend-integration.md §2.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: env.API_PROXY_TARGET
      ? {
          proxy: {
            '/api': {
              target: env.API_PROXY_TARGET,
              rewrite: path => path.replace(/^\/api/, ''),
            },
          },
        }
      : undefined,
  }
})
