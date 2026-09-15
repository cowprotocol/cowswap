/* eslint-disable @typescript-eslint/explicit-function-return-type */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const { createAdditionalSitemapPaths, fetchAllSitemapArticles, getArchivePageLastmod } = require('./sitemap-articles')

const getSitemapArticlesCached = cacheAsyncFunction(fetchAllSitemapArticles)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://cow.fi',
  generateRobotsTxt: false, // robots.ts owns this endpoint
  generateIndexSitemap: false, // A single urlset is sufficient and better supported by simple crawler tooling
  autoLastmod: false, // Only emit dates that reflect real CMS content updates
  sitemapSize: 5000,
  outDir: path.join(__dirname, 'public'),
  sourceDir: path.join(__dirname, '.next'),
  // Archive pages are re-added from the live CMS count, omitting /1 and phantom pages.
  exclude: ['/api/*', '/robots.txt', '/learn/articles/*'],
  transform: async (config, url) => {
    if (url === '/learn/articles') {
      const { archiveArticles } = await getSitemapArticlesCached()
      const lastmod = getArchivePageLastmod(archiveArticles, 1)

      return {
        loc: url,
        ...(lastmod ? { lastmod } : {}),
      }
    }

    const topLevelLearnPath = url.match(/^\/learn\/([^/]+)$/)

    if (topLevelLearnPath && !['articles', 'topics'].includes(topLevelLearnPath[1])) {
      const { articles } = await getSitemapArticlesCached()
      const article = articles.find(({ slug }) => slug === topLevelLearnPath[1])

      // Dynamic or stale article routes must not become sitemap entries.
      if (!article) return null

      return {
        loc: url,
        ...(article.updatedAt ? { lastmod: article.updatedAt } : {}),
      }
    }

    return {
      loc: url,
      changefreq: config.changefreq,
      priority: config.priority,
    }
  },
  additionalPaths: async () => {
    const { archiveArticles, articles, total } = await getSitemapArticlesCached()

    return createAdditionalSitemapPaths(articles, total, archiveArticles)
  },
}

function cacheAsyncFunction(fn) {
  let result

  return function cached(...args) {
    if (!result) {
      result = fn(...args).catch((error) => {
        result = undefined
        throw error
      })
    }

    return result
  }
}
