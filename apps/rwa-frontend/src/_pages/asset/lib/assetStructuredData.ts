import { getAssetSeoDescription, getAssetSeoTitle } from './assetSeo'

import type { RwaAsset } from '@/entities/asset'

import { buildBreadcrumbList, buildWebPage, SITE_NAME } from '@/shared/lib/seo/index.server'

/** `WebPage` of an asset page with its breadcrumbs, about the company, fund or commodity behind the asset */
export function buildAssetStructuredData(asset: RwaAsset): object {
  const path = `/asset/${asset.ticker}`

  return buildWebPage({
    path,
    name: getAssetSeoTitle(asset),
    description: getAssetSeoDescription(asset),
    breadcrumb: buildBreadcrumbList([
      { name: SITE_NAME, path: '' },
      { name: `${asset.title} (${asset.ticker})`, path },
    ]),
    about: buildUnderlying(asset),
  })
}

function buildUnderlying({ type, title, ticker, profile }: RwaAsset): object {
  const details = { description: profile?.description, url: profile?.website }

  switch (type) {
    case 'stock':
      return { '@type': 'Corporation', name: title, tickerSymbol: ticker, ...details }
    case 'index':
      return { '@type': 'InvestmentFund', name: title, identifier: ticker, ...details }
    case 'commodity':
      return { '@type': 'Thing', name: title, identifier: ticker }
  }
}
