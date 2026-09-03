import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const pages = [
  'index.html',
  'jaguar-restoration.html',
  'mg-restoration.html',
  'triumph-restoration.html',
  'austin-healey-restoration.html',
  'mini-restoration.html',
  'morris-minor-restoration.html',
  'american-classics-restoration.html',
  'other-british-marques.html',
  'services.html',
  'process.html',
  'faq.html',
  'reviews.html',
  'careers.html',
  'journal.html',
  'journal-mini-subframes.html',
  'engine-rebuilding.html',
  'paint-bodywork.html',
  'upholstery.html',
  'electrical-rewiring.html',
  'quote-thanks.html',
]

export default defineConfig({
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replace('.html', ''), resolve(__dirname, page)])
      ),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
})
