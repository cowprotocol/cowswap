const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 200,
  sourceDir: path.join(__dirname, '.next'),
  outDir: path.join(__dirname, 'public'),
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
