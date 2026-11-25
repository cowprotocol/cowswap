import type { RwaAssetListItem } from '@/entities/asset'

import { buildWebPage, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/lib/seo/index.server'

/** `WebPage` of the home page, listing the assets the table renders first */
export function buildHomeStructuredData(assets: Pick<RwaAssetListItem, 'ticker' | 'title'>[]): object {
  return buildWebPage({
    path: '',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    ...(assets.length && {
      mainEntity: {
        '@type': 'ItemList',
        name: 'Most traded tokenized assets',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: assets.length,
        itemListElement: assets.map(({ ticker, title }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${title} (${ticker})`,
          url: `${SITE_URL}/asset/${ticker}`,
        })),
      },
    }),
  })
}
