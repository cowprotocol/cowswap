import { renderSitemap } from 'simple-sitemap-renderer'
import fs from 'fs'

const OUTPUT_FILE = 'public/sitemap.xml'
export const PRODUCTION_URL = 'https://cowswap.exchange'

const PAGES = [
  'swap',
  'about',
  // 'profile',
  'faq',
  'play/cow-runner',
  'play/mev-slicer',
  'privacy-policy',
  'cookie-policy',
  'terms-and-conditions',
]

const entries = PAGES.map((name) => ({ url: `${PRODUCTION_URL}/#/${name}` }))

const sitemap = renderSitemap(entries, {})

console.log('Sitemap file generated in:', OUTPUT_FILE)
fs.writeFileSync(OUTPUT_FILE, sitemap)
