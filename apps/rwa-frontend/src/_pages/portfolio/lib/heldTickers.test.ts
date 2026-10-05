import { getHeldTickersKey, MAX_PORTFOLIO_MARKETS } from './heldTickers'

import type { RwaAsset, RwaAssetSummary, RwaToken, RwaTokenSummary } from '@/entities/asset'
import type { Position } from '@/widgets/account'

function asset(ticker: string): RwaAsset {
  return { ticker, coingeckoId: ticker.toLowerCase(), title: ticker, type: 'stock', priority: 0, tokens: [] }
}

function position(symbol: string): Position {
  return { token: token(symbol), balance: '1' }
}

function token(symbol: string): RwaToken {
  return {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000001',
    symbol,
    name: symbol,
    decimals: 18,
    issuer: 'Ondo',
  }
}

const bySymbol = (tokenToFind: RwaTokenSummary): RwaAssetSummary | undefined =>
  tokenToFind.symbol === 'UNKNOWN' ? undefined : asset(tokenToFind.symbol.replace(/(x|on)$/, ''))

describe('getHeldTickersKey', () => {
  it('returns the sorted unique tickers of the held tokens', () => {
    expect(getHeldTickersKey([position('NVDAx'), position('AAPLon'), position('NVDAon')], bySymbol)).toBe('AAPL,NVDA')
  })

  it('ignores tokens of unknown assets', () => {
    expect(getHeldTickersKey([position('UNKNOWN'), position('AAPLx')], bySymbol)).toBe('AAPL')
  })

  it('returns an empty key without positions', () => {
    expect(getHeldTickersKey(null, bySymbol)).toBe('')
    expect(getHeldTickersKey([], bySymbol)).toBe('')
  })

  it('caps the tickers at the limit', () => {
    const positions = Array.from({ length: MAX_PORTFOLIO_MARKETS + 5 }, (_, index) => position(`T${index}x`))

    expect(getHeldTickersKey(positions, bySymbol).split(',')).toHaveLength(MAX_PORTFOLIO_MARKETS)
  })
})
