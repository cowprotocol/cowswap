import { toQueryParams } from './queryParams'

describe('toQueryParams', () => {
  it('flattens nested Strapi query objects into stable key-value params', () => {
    expect(
      toQueryParams({
        filters: {
          slug: {
            $eq: 'aave-trade-breakdown',
          },
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
        populate: {
          seo: {
            fields: ['metaTitle', 'metaDescription'],
          },
        },
      }),
    ).toEqual({
      'filters[slug][$eq]': 'aave-trade-breakdown',
      'pagination[page]': '1',
      'pagination[pageSize]': '2',
      'populate[seo][fields][0]': 'metaTitle',
      'populate[seo][fields][1]': 'metaDescription',
    })
  })

  it('keeps encoded delimiters inside values instead of creating new params', () => {
    expect(
      toQueryParams({
        filters: {
          slug: {
            $eq: 'amm&publicationState=preview',
          },
        },
      }),
    ).toEqual({
      'filters[slug][$eq]': 'amm&publicationState=preview',
    })
  })
})
