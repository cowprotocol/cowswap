import qs from 'qs'

/**
 * Helper util to convert nested objects in qs format (https://www.npmjs.com/package/qs) to generate query params in key value format
 * 
 For example will convert this:

 ```json
 {
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
    cover: '*',
    blocks: '*',
    seo: {
      fields: ['metaTitle', 'metaDescription'],
      populate: {
        shareImage: {
          fields: ['url'],
        },
      },
    },
    authorsBio: '*',
  },
}
```

into this:

```json
 {
  'filters[slug][$eq]': 'aave-trade-breakdown',
  'pagination[page]': '1',
  'pagination[pageSize]': '2',
  'populate[cover]': '*',
  'populate[blocks]': '*',
  'populate[seo][fields][0]': 'metaTitle',
  'populate[seo][fields][1]': 'metaDescription',
  'populate[seo][populate][shareImage][fields][0]': 'url',
  'populate[authorsBio]': '*'
}
```
 * 
 * @param query the object in qs format
 * 
 * @returns the object in key value format
 */
export function toQueryParams(query: unknown): { [key: string]: string } {
  const queryString = qs.stringify(query, { encode: false })

  return queryString.split('&').reduce<{ [key: string]: string }>((acc, pair) => {
    const [key, value] = pair.split('=')
    acc[key] = value
    return acc
  }, {})
}
