import { buildArticleStructuredData, getArticleSeoData, getRelationNames, serializeJsonLd } from './articleSeo'

import type { Article } from '../services/cms'

const article: Article = {
  id: 42,
  attributes: {
    title: 'How intents protect traders',
    description: '<p>A safer way to trade.</p>',
    slug: 'how-intents-protect-traders',
    cover: {
      data: {
        attributes: {
          url: '/uploads/intents.png',
        },
      },
    },
    featured: false,
    publishDate: '2026-08-20T12:00:00+02:00',
    publishDateVisible: true,
    publishedAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-21T10:30:00.000Z',
    authorsBio: {
      data: [{ attributes: { name: 'Alice' } }],
    },
    categories: {
      data: [{ attributes: { name: 'MEV' } }],
    },
  },
}

describe('getArticleSeoData', () => {
  it('builds canonical article metadata from CMS fields', () => {
    expect(getArticleSeoData(article, 'how-intents-protect-traders')).toEqual({
      authorNames: ['Alice'],
      canonicalUrl: 'https://cow.fi/learn/how-intents-protect-traders',
      categoryNames: ['MEV'],
      description: 'A safer way to trade.',
      imageUrl: 'https://cow.fi/uploads/intents.png',
      modifiedTime: '2026-08-21T10:30:00.000Z',
      publishedTime: '2026-08-20T10:00:00.000Z',
      title: 'How intents protect traders',
    })
  })
})

describe('buildArticleStructuredData', () => {
  it('emits BlogPosting and BreadcrumbList nodes', () => {
    const structuredData = buildArticleStructuredData(article, 'how-intents-protect-traders')

    expect(structuredData['@context']).toBe('https://schema.org')
    expect(structuredData['@graph'][0]).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'How intents protect traders',
      datePublished: '2026-08-20T10:00:00.000Z',
      image: ['https://cow.fi/uploads/intents.png'],
      articleSection: ['MEV'],
    })
    expect(structuredData['@graph'][1]).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        expect.objectContaining({ position: 1, item: 'https://cow.fi' }),
        expect.objectContaining({ position: 2, item: 'https://cow.fi/learn' }),
        expect.objectContaining({ position: 3, item: 'https://cow.fi/learn/how-intents-protect-traders' }),
      ],
    })
  })
})

describe('getRelationNames', () => {
  it('reads both one-to-one and one-to-many Strapi relations', () => {
    expect(getRelationNames({ data: { attributes: { name: 'Alice' } } })).toEqual(['Alice'])
    expect(
      getRelationNames({
        data: [{ attributes: { name: 'MEV' } }, { attributes: { name: 'Trading' } }, null],
      }),
    ).toEqual(['MEV', 'Trading'])
  })
})

describe('serializeJsonLd', () => {
  it('escapes opening HTML tags in CMS-provided values', () => {
    expect(serializeJsonLd({ headline: '</script><script>alert(1)</script>' })).toBe(
      '{"headline":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}',
    )
  })
})
