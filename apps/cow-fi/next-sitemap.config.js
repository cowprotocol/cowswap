const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  outDir: path.join(__dirname, 'public'),
  sourceDir: path.join(__dirname, '.next'),
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  transform: async (config, url) => {
    // Handle /learn/* pages with lastmod from CMS
    if (url.startsWith('/learn/')) {
      try {
        console.log(`Transforming learn page: ${url}`)
        const articles = await getAllArticleSlugsWithDates()
        const article = articles.find(({ slug }) => `/learn/${slug}` === url)

        if (article) {
          console.log(`Found matching article for ${url}`)
          return {
            loc: url,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: article.updatedAt,
          }
        } else {
          console.log(`No matching article found for ${url}`)
        }
      } catch (error) {
        console.error(`Error processing ${url}:`, error)
      }
    }

    console.log(`Applying default transformation for: ${url}`)
    return {
      loc: url,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}

/**
 * Function to fetch all article slugs with lastModified dates from the CMS API
 * Implements pagination to fetch all pages of articles
 */
async function getAllArticleSlugsWithDates() {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'
  const cmsApiUrl = `${cmsBaseUrl}/articles`
  let allArticles = []
  let page = 1
  let hasMorePages = true

  while (hasMorePages) {
    try {
      const url = `${cmsApiUrl}?pagination[page]=${page}&pagination[pageSize]=100`
      console.log(`Fetching articles from: ${url}`)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const articles = data.data
      allArticles = allArticles.concat(articles)

      console.log(`Fetched ${articles.length} articles from page ${page}`)

      // Check if there are more pages
      hasMorePages = data.meta.pagination.page < data.meta.pagination.pageCount
      page++
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error)
      hasMorePages = false // Stop trying if there's an error
    }
  }

  console.log(`Total articles fetched: ${allArticles.length}`)

  return allArticles.map((article) => ({
    slug: article.attributes.slug,
    updatedAt: article.attributes.updatedAt,
  }))
}
