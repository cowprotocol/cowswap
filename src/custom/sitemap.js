/* eslint-disable @typescript-eslint/no-var-requires */
const { renderSitemap } = require('simple-sitemap-renderer')
const fs = require('fs')

const OUTPUT_FILE = 'public/sitemap.xml'
const PRODUCTION_URL = 'https://cowswap.exchange'

const PAGES = [
  // Main pages
  'swap',
  'about',
  // 'profile',
  'faq',

  // External pages
  'chat',
  'docs',
  'stats',
  'twitter',

  // Additional pages
  'play/cow-runner',
  'play/mev-slicer',
  'privacy-policy',
  // 'cookie-policy',
  'terms-and-conditions',
]

const entries = PAGES.map((name) => ({ url: `${PRODUCTION_URL}/#/${name}` }))

const sitemap = renderSitemap(entries, {})

console.log('Sitemap file generated in:', OUTPUT_FILE)
fs.writeFileSync(OUTPUT_FILE, sitemap)
