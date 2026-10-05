import { buildHoldings, getPortfolioTotals } from './holdings'

import type { RwaAsset, RwaToken } from '@/entities/asset'

const AAPLX: RwaToken = {
  chainId: 1,
  address: '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a',
  symbol: 'AAPLx',
  name: 'Apple xStock',
  decimals: 18,
  issuer: 'xStocks',
}
const AAPLX_BNB: RwaToken = { ...AAPLX, chainId: 56 }
const QQQX: RwaToken = { ...AAPLX, address: '0xa753a7395cae905cd615da0b82a53e0560f250af', symbol: 'QQQx' }
const SPYX: RwaToken = { ...AAPLX, address: '0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48', symbol: 'SPYx' }

const AAPL: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'aapl',
  title: 'Apple',
  type: 'stock',
  priority: 10,
  tokens: [AAPLX, AAPLX_BNB],
}
const QQQ: RwaAsset = {
  ticker: 'QQQ',
  coingeckoId: 'qqq',
  title: 'Invesco QQQ',
  type: 'index',
  priority: 5,
  tokens: [QQQX],
}
const SPY: RwaAsset = {
  ticker: 'SPY',
  coingeckoId: 'spy',
  title: 'SPDR S&P 500',
  type: 'index',
  priority: 5,
  tokens: [SPYX],
}

const PRICES: Record<string, number> = { AAPL: 200, QQQ: 500 }
const getPrice = (asset: RwaAsset): number | null => PRICES[asset.ticker] ?? null

describe('buildHoldings', () => {
  it('sums the tokens of an asset across networks and values them at the asset price', () => {
    const [apple] = buildHoldings(
      [AAPL],
      [
        { token: { ...AAPLX, address: AAPLX.address.toLowerCase() }, balance: '1500000000000000000' },
        { token: AAPLX_BNB, balance: '500000000000000000' },
      ],
      getPrice,
    )

    expect(apple?.shares).toBe(2)
    expect(apple?.value).toBe(400)
    expect(apple?.tokens.map(({ value }) => value)).toEqual([300, 100])
  })

  it('skips assets without balances and puts the unpriced holdings last', () => {
    const holdings = buildHoldings(
      [SPY, AAPL, QQQ],
      [
        { token: SPYX, balance: '1000000000000000000' },
        { token: AAPLX, balance: '1000000000000000000' },
        { token: QQQX, balance: '1000000000000000000' },
      ],
      getPrice,
    )

    expect(holdings.map(({ asset, value }) => [asset.ticker, value])).toEqual([
      ['QQQ', 500],
      ['AAPL', 200],
      ['SPY', null],
    ])
  })
})

describe('getPortfolioTotals', () => {
  it('counts assets, tokens and networks, and sums the priced value', () => {
    const holdings = buildHoldings(
      [AAPL, SPY],
      [
        { token: AAPLX, balance: '1000000000000000000' },
        { token: AAPLX_BNB, balance: '1000000000000000000' },
        { token: SPYX, balance: '1000000000000000000' },
      ],
      getPrice,
    )

    expect(getPortfolioTotals(holdings)).toEqual({ value: 400, assets: 2, tokens: 3, networks: 2, unpricedAssets: 1 })
  })

  it('has no value without prices', () => {
    expect(getPortfolioTotals([]).value).toBeNull()
  })
})
