import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * The link-preview tags (WhatsApp, Instagram, …) need absolute URLs, but the site address is only known once
 * it is deployed. Netlify exposes it to the build: `URL` is the primary site URL, `DEPLOY_PRIME_URL` the
 * deploy-preview URL. This fills `%SITE_URL%` in index.html at build time (and points at localhost in dev).
 */
function siteUrl(): Plugin {
  const url = (process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:5173').replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteUrl()],
  build: {
    rollupOptions: {
      output: {
        // webfonts get their own folder, so public/_headers can cache them for good (their names are hashed)
        assetFileNames: (info) =>
          /\.(woff2?)$/.test(info.names?.[0] ?? '') ? 'assets/fonts/[name]-[hash][extname]' : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
