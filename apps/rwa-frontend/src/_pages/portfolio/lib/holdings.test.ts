import { buildHoldings, getPortfolioTotals, type HoldingPrices } from './holdings'

import { getTokenKey, type RwaAsset, type RwaToken } from '@/entities/asset'

const AAPLX: RwaToken = {
  chainId: 1,
  address: '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a',
  symbol: 'AAPLx',
  name: 'Apple xStock',
  decimals: 18,
  issuer: 'xStocks',
}
const AAPLX_BNB: RwaToken = { ...AAPLX, chainId: 56 }
const AAPLON: RwaToken = {
  ...AAPLX,
  address: '0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c',
  symbol: 'AAPLon',
  name: 'Apple (Ondo Tokenized)',
  issuer: 'Ondo',
}
const QQQX: RwaToken = { ...AAPLX, address: '0xa753a7395cae905cd615da0b82a53e0560f250af', symbol: 'QQQx' }
const SPYX: RwaToken = { ...AAPLX, address: '0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48', symbol: 'SPYx' }

const AAPL: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'aapl',
  title: 'Apple',
  type: 'stock',
  priority: 10,
  tokens: [AAPLX, AAPLX_BNB, AAPLON],
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

const ONE = '1000000000000000000'
const PRICES: Record<string, number> = { AAPL: 200, QQQ: 500 }

function prices(tokenPrices: Record<string, number> = {}, sharesPerToken: Record<string, number> = {}): HoldingPrices {
  return {
    getAssetPrice: (asset) => PRICES[asset.ticker] ?? null,
    getTokenPrice: (token) => tokenPrices[getTokenKey(token)] ?? null,
    getSharesPerToken: (token) => sharesPerToken[getTokenKey(token)] ?? null,
  }
}

const APPLE_POSITIONS = [
  { token: { ...AAPLX, address: AAPLX.address.toLowerCase() }, balance: '1500000000000000000' },
  { token: AAPLX_BNB, balance: '500000000000000000' },
]

describe('buildHoldings', () => {
  it('sums the tokens of an asset across networks and values them at the asset price', () => {
    const [apple] = buildHoldings([AAPL], APPLE_POSITIONS, prices())

    expect(apple?.shares).toBe(2)
    expect(apple?.value).toBe(400)
    expect(apple?.tokens.map(({ value }) => value)).toEqual([300, 100])
  })

  it('matches the token price of a position whose address casing differs', () => {
    const [apple] = buildHoldings([AAPL], APPLE_POSITIONS, prices({ [getTokenKey(AAPLX)]: 210 }))

    expect(apple?.tokens.map(({ value }) => value)).toEqual([315, 100])
    expect(apple?.value).toBe(415)
    expect(apple?.shares).toBe(2)
  })

  it('skips assets without balances and puts the unpriced holdings last', () => {
    const holdings = buildHoldings(
      [SPY, AAPL, QQQ],
      [
        { token: SPYX, balance: ONE },
        { token: AAPLX, balance: ONE },
        { token: QQQX, balance: ONE },
      ],
      prices(),
    )

    expect(holdings.map(({ asset, value }) => [asset.ticker, value])).toEqual([
      ['QQQ', 500],
      ['AAPL', 200],
      ['SPY', null],
    ])
  })

  it('values each token at its own price', () => {
    const [apple] = buildHoldings(
      [AAPL],
      [
        { token: AAPLX, balance: ONE },
        { token: AAPLON, balance: ONE },
      ],
      prices({ [getTokenKey(AAPLON)]: 210 }),
    )

    expect(apple?.tokens.map(({ value }) => value)).toEqual([200, 210])
    expect(apple?.value).toBe(410)
  })

  it('multiplies the balance by the issuer multiplier, whatever the token price', () => {
    const [apple] = buildHoldings(
      [AAPL],
      [{ token: AAPLON, balance: '2000000000000000000' }],
      prices({ [getTokenKey(AAPLON)]: 190 }, { [getTokenKey(AAPLON)]: 1.0125 }),
    )

    expect(apple?.shares).toBeCloseTo(2.025)
    expect(apple?.value).toBeCloseTo(405)
  })

  it('values tokens of one CoinGecko id by the multiplier of their network', () => {
    const aaplonBnb: RwaToken = { ...AAPLON, chainId: 56 }
    const [apple] = buildHoldings(
      [{ ...AAPL, tokens: [AAPLON, aaplonBnb] }],
      [
        { token: AAPLON, balance: ONE },
        { token: aaplonBnb, balance: ONE },
      ],
      prices(
        { [getTokenKey(AAPLON)]: 200, [getTokenKey(aaplonBnb)]: 200 },
        { [getTokenKey(AAPLON)]: 0.99, [getTokenKey(aaplonBnb)]: 1 },
      ),
    )

    expect(apple?.tokens.map(({ value }) => value)).toEqual([198, 200])
  })

  it('counts fewer shares than tokens after a reverse split', () => {
    const [apple] = buildHoldings(
      [AAPL],
      [{ token: AAPLON, balance: ONE }],
      prices({}, { [getTokenKey(AAPLON)]: 0.25 }),
    )

    expect(apple?.shares).toBe(0.25)
  })

  it('values the shares a token stands for at the stock price without a token price', () => {
    const [apple] = buildHoldings([AAPL], [{ token: AAPLON, balance: ONE }], prices({}, { [getTokenKey(AAPLON)]: 10 }))

    expect(apple?.value).toBe(2000)
  })

  it('estimates Ondo shares from the token price without the issuer multiplier', () => {
    const [apple] = buildHoldings([AAPL], [{ token: AAPLON, balance: ONE }], prices({ [getTokenKey(AAPLON)]: 210 }))

    expect(apple?.shares).toBeCloseTo(1.05)
  })

  it('falls back to the stock price and one share per token without a token price', () => {
    const [apple] = buildHoldings([AAPL], [{ token: AAPLON, balance: ONE }], prices())

    expect(apple?.shares).toBe(1)
    expect(apple?.value).toBe(200)
  })

  it('values a token by its own price when the stock price is unknown', () => {
    const [spy] = buildHoldings([SPY], [{ token: SPYX, balance: ONE }], prices({ [getTokenKey(SPYX)]: 600 }))

    expect(spy?.value).toBe(600)
    expect(spy?.shares).toBe(1)
  })

  it('keeps a rebasing token at one share per token above the stock price', () => {
    const [apple] = buildHoldings([AAPL], [{ token: AAPLX, balance: ONE }], prices({ [getTokenKey(AAPLX)]: 210 }))

    expect(apple?.shares).toBe(1)
    expect(apple?.value).toBe(210)
  })

  it('has no holding value while one of its tokens is unpriced', () => {
    const [spy] = buildHoldings(
      [{ ...SPY, tokens: [SPYX, AAPLON] }],
      [
        { token: SPYX, balance: ONE },
        { token: AAPLON, balance: ONE },
      ],
      prices({ [getTokenKey(SPYX)]: 600 }),
    )

    expect(spy?.value).toBeNull()
  })
})

describe('getPortfolioTotals', () => {
  it('counts assets, tokens and networks, and sums the priced value', () => {
    const holdings = buildHoldings(
      [AAPL, SPY],
      [
        { token: AAPLX, balance: ONE },
        { token: AAPLX_BNB, balance: ONE },
        { token: SPYX, balance: ONE },
      ],
      prices(),
    )

    expect(getPortfolioTotals(holdings)).toEqual({ value: 400, assets: 2, tokens: 3, networks: 2, unpricedAssets: 1 })
  })

  it('has no value without prices', () => {
    expect(getPortfolioTotals([]).value).toBeNull()
  })
})
