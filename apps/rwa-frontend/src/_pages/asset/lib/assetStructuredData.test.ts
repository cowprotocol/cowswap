import { buildAssetStructuredData } from './assetStructuredData'
import { AAPLX_MAINNET } from './fixtures'

import type { RwaAsset } from '@/entities/asset'

const AAPL: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'apple',
  title: 'Apple',
  type: 'stock',
  priority: 10,
  profile: {
    description: 'Apple designs consumer electronics.',
    sector: 'Information Technology · Technology Hardware',
    website: 'https://www.apple.com',
  },
  tokens: [AAPLX_MAINNET],
}

describe('buildAssetStructuredData', () => {
  it('describes the page with its breadcrumbs and the company behind the asset', () => {
    expect(buildAssetStructuredData(AAPL)).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: 'https://swap.cow.fi/rwa/asset/AAPL',
        name: 'Apple (AAPL) tokenized stock',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'CoW Swap', item: 'https://swap.cow.fi/rwa' },
            { '@type': 'ListItem', position: 2, name: 'Apple (AAPL)', item: 'https://swap.cow.fi/rwa/asset/AAPL' },
          ],
        },
        about: {
          '@type': 'Corporation',
          name: 'Apple',
          tickerSymbol: 'AAPL',
          description: 'Apple designs consumer electronics.',
          url: 'https://www.apple.com',
        },
      }),
    )
  })

  it('describes a fund as an investment fund', () => {
    const spy: RwaAsset = { ...AAPL, ticker: 'SPY', title: 'SPDR S&P 500 ETF', type: 'index', profile: undefined }

    expect(buildAssetStructuredData(spy)).toEqual(
      expect.objectContaining({ about: { '@type': 'InvestmentFund', name: 'SPDR S&P 500 ETF', identifier: 'SPY' } }),
    )
  })
})
