const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://cow.fi',
  generateRobotsTxt: false, // Disable since we're using robots.ts file instead
  sitemapSize: 5000,
  outDir: path.join(__dirname, 'public'),
  sourceDir: path.join(__dirname, '.next'),
  exclude: ['/api/*'],
  transform: async (config, url) => {
    // Handle /learn/* pages with lastmod from CMS
    if (url.startsWith('/learn/')) {
      try {
        console.log(`Transforming learn page: ${url}`)
        const articles = await getAllArticleSlugsWithDatesCached()
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

    // Handle /resources/* pages with lastmod from CMS
    if (url.startsWith('/resources/') && url.split('/').length >= 4) {
      try {
        console.log(`Transforming resource page: ${url}`)
        const resources = await getAllResourceSlugsWithDatesCached()
        const resource = resources.find(({ path }) => path === url)

        if (resource) {
          console.log(`Found matching resource for ${url}`)
          return {
            loc: url,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: resource.updatedAt,
          }
        } else {
          console.log(`No matching resource found for ${url}`)
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

function cacheAsyncFunction(fn) {
  const EMPTY = Symbol()
  let result = EMPTY

  return async function (...args) {
    if (result !== EMPTY) return result

    result = fn(...args).catch((err) => {
      result = EMPTY
      throw err
    })

    return result
  }
}

/** @type {typeof getAllArticleSlugsWithDates} */
const getAllArticleSlugsWithDatesCached = cacheAsyncFunction(getAllArticleSlugsWithDates)

/** @type {typeof getAllResourceSlugsWithDates} */
const getAllResourceSlugsWithDatesCached = cacheAsyncFunction(getAllResourceSlugsWithDates)

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

/**
 * Function to fetch all resource slugs with lastModified dates from the CMS API
 */
async function getAllResourceSlugsWithDates() {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'
  const cmsApiUrl = `${cmsBaseUrl}/resources`
  let allResources = []
  let page = 1
  let hasMorePages = true

  while (hasMorePages) {
    try {
      const url = `${cmsApiUrl}?pagination[page]=${page}&pagination[pageSize]=100&fields[0]=slug&fields[1]=campaign&fields[2]=updatedAt`
      console.log(`Fetching resources from: ${url}`)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const resources = data.data
      allResources = allResources.concat(resources)

      console.log(`Fetched ${resources.length} resources from page ${page}`)

      hasMorePages = data.meta.pagination.page < data.meta.pagination.pageCount
      page++
    } catch (error) {
      console.error('Error fetching resources for sitemap:', error)
      hasMorePages = false
    }
  }

  console.log(`Total resources fetched: ${allResources.length}`)

  return allResources
    .filter((resource) => resource.attributes?.slug && resource.attributes?.campaign)
    .map((resource) => ({
      path: `/resources/${resource.attributes.campaign}/${resource.attributes.slug}`,
      updatedAt: resource.attributes.updatedAt,
    }))
}
