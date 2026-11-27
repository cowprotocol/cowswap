const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const CMS_COLLECTION_TIMEOUT_MS = 5_000
const CMS_PAGE_SIZE = 100
const MAX_CMS_PAGES = 1_000
const CMS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const RESERVED_LEARN_SLUGS = new Set(['articles', 'topics'])

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://cow.fi',
  generateRobotsTxt: false, // Disable since we're using robots.ts file instead
  sitemapSize: 5000,
  outDir: path.join(__dirname, 'public'),
  sourceDir: path.join(__dirname, '.next'),
  exclude: ['/api/*'],
  transform: async (config, url) => getSitemapField(config, url),
  additionalPaths: async (config) => {
    const [articles, resources, categories] = await Promise.all([
      getPublishedEntries('articles', ['slug', 'updatedAt']),
      getPublishedEntries('resources', ['slug', 'campaign', 'updatedAt']),
      getPublishedEntries('categories', ['slug']),
    ])

    const paths = new Map()

    for (const { slug, updatedAt } of articles) {
      if (isValidCmsSlug(slug) && !RESERVED_LEARN_SLUGS.has(slug)) {
        paths.set(`/learn/${slug}`, updatedAt)
      }
    }

    for (const { campaign, slug, updatedAt } of resources) {
      if (isValidCmsSlug(campaign) && isValidCmsSlug(slug)) {
        paths.set(`/resources/${campaign}`, undefined)
        paths.set(`/resources/${campaign}/${slug}`, updatedAt)
      }
    }

    for (const { slug } of categories) {
      if (isValidCmsSlug(slug)) {
        paths.set(`/learn/topic/${slug}`, undefined)
      }
    }

    return Array.from(paths, ([url, updatedAt]) => getSitemapField(config, url, updatedAt))
  },
}

async function getPublishedEntries(collection, fields) {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'
  const signal = AbortSignal.timeout(CMS_COLLECTION_TIMEOUT_MS)
  const entries = []

  for (let page = 1; page <= MAX_CMS_PAGES; page++) {
    try {
      const url = new URL(`${cmsBaseUrl.replace(/\/$/, '')}/${collection}`)
      url.searchParams.set('publicationState', 'live')
      url.searchParams.set('pagination[page]', String(page))
      url.searchParams.set('pagination[pageSize]', String(CMS_PAGE_SIZE))
      fields.forEach((field, index) => url.searchParams.set(`fields[${index}]`, field))

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const { data, meta } = await response.json()
      if (!Array.isArray(data)) throw new Error('Invalid entries')

      const { page: responsePage, pageCount } = meta?.pagination ?? {}
      if (responsePage !== page || !Number.isInteger(pageCount) || pageCount < 0) {
        throw new Error('Invalid pagination')
      }

      for (const item of data) {
        if (item?.attributes) entries.push(item.attributes)
      }

      if (data.length === 0 || page >= pageCount) break
    } catch (error) {
      console.error(`Error fetching ${collection} page ${page} for sitemap:`, error)
      break
    }
  }

  return entries
}

function getSitemapField(config, url, updatedAt) {
  const lastmod =
    typeof updatedAt === 'string' && Number.isFinite(Date.parse(updatedAt)) ? new Date(updatedAt) : new Date()

  return {
    loc: url,
    changefreq: config.changefreq,
    priority: config.priority,
    lastmod: lastmod.toISOString(),
  }
}

function isValidCmsSlug(slug) {
  return typeof slug === 'string' && CMS_SLUG_PATTERN.test(slug)
}
