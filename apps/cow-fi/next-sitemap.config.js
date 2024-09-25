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
      const articles = await getAllArticleSlugsWithDates()
      const article = articles.find(({ slug }) => `/learn/${slug}` === url)
      if (article) {
        return {
          loc: url,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: article.lastModified,
        }
      }
    }

    // Handle /tokens/* pages
    if (url.startsWith('/tokens/')) {
      return {
        loc: url,
        changefreq: 'daily',
        priority: 0.6,
        lastmod: new Date().toISOString(), // Assume updated daily
      }
    }

    // Default transformation for all other pages
    return {
      loc: url,
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    }
  },
}

/**
 * Function to fetch all article slugs with lastModified dates from the CMS API
 * Implements caching to avoid redundant network requests
 */
async function getAllArticleSlugsWithDates() {
  // Check if articles are already cached
  if (getAllArticleSlugsWithDates.cachedArticles) {
    return getAllArticleSlugsWithDates.cachedArticles
  }

  const articles = []
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'
  const cmsApiUrl = `${cmsBaseUrl}/articles`

  let page = 1
  const pageSize = 100
  let totalPages = 1

  while (page <= totalPages) {
    try {
      console.log(`Fetching page ${page} of articles from CMS...`)

      const params = new URLSearchParams({
        'query[fields]': 'slug,updatedAt', // Fetch both slug and updatedAt
        'query[pagination][page]': page,
        'query[pagination][pageSize]': pageSize,
      })

      const response = await fetch(`${cmsApiUrl}?${params.toString()}`, {
        headers: {
          // Include Authorization header if required
          // Authorization: `Bearer ${process.env.CMS_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`)
      }

      const data = await response.json()

      // Adjust based on your actual CMS API response structure
      data.data.forEach((article) => {
        articles.push({
          slug: article.attributes.slug, // Ensure 'slug' is the correct field
          lastModified: article.attributes.updatedAt, // Ensure 'updatedAt' is the correct field
        })
      })

      const pagination = data.meta.pagination
      totalPages = pagination.pageCount
      page += 1
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error)
      throw error
    }
  }

  console.log(`Total articles fetched: ${articles.length}`)

  // Cache the fetched articles
  getAllArticleSlugsWithDates.cachedArticles = articles

  return articles
}
