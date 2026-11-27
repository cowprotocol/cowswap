/** @jest-environment node */

import sitemapConfig from './next-sitemap.config'

const sitemapSettings = { siteUrl: 'https://cow.fi', changefreq: 'daily', priority: 0.7 } as const
const updatedAt = '2026-10-21T10:00:00.000Z'

function cmsPage(
  data: { attributes: { slug: string; campaign?: string; updatedAt?: string } }[],
  page = 1,
  pageCount = 1,
): Response {
  return Response.json({ data, meta: { pagination: { page, pageCount } } })
}

afterEach(() => {
  jest.restoreAllMocks()
})

it('adds valid published CMS paths across pages with their last modified dates', async () => {
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = new URL(String(input))
    expect(url.searchParams.get('publicationState')).toBe('live')

    if (url.pathname.endsWith('/articles')) {
      if (url.searchParams.get('pagination[page]') === '2') {
        return cmsPage([{ attributes: { slug: 'second-article', updatedAt } }], 2, 2)
      }

      return cmsPage(
        [
          { attributes: { slug: 'first-article', updatedAt } },
          { attributes: { slug: 'articles', updatedAt } },
          { attributes: { slug: '../legal', updatedAt } },
        ],
        1,
        2,
      )
    }

    if (url.pathname.endsWith('/resources')) {
      const resource = { attributes: { slug: 'one-resource', campaign: 'price-guide', updatedAt } }
      return cmsPage([resource, resource])
    }

    return cmsPage([{ attributes: { slug: 'crypto-basics' } }])
  })

  const fields = await sitemapConfig.additionalPaths?.(sitemapSettings)

  expect(fields?.map(({ loc }) => loc)).toEqual([
    '/learn/first-article',
    '/learn/second-article',
    '/resources/price-guide',
    '/resources/price-guide/one-resource',
    '/learn/topic/crypto-basics',
  ])
  expect(fields?.find(({ loc }) => loc === '/learn/second-article')?.lastmod).toBe(updatedAt)
  expect(fields?.find(({ loc }) => loc === '/resources/price-guide/one-resource')?.lastmod).toBe(updatedAt)
})

it('keeps static pages and other CMS paths when one collection fails', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = new URL(String(input))
    if (url.pathname.endsWith('/resources')) return new Response(null, { status: 503 })
    if (url.pathname.endsWith('/articles')) return cmsPage([{ attributes: { slug: 'article' } }])
    return cmsPage([{ attributes: { slug: 'category' } }])
  })

  const fields = await sitemapConfig.additionalPaths?.(sitemapSettings)

  expect(fields?.map(({ loc }) => loc)).toEqual(['/learn/article', '/learn/topic/category'])
  expect(await sitemapConfig.transform?.(sitemapSettings, '/cow-swap')).toMatchObject({ loc: '/cow-swap' })
})
