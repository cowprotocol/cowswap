import { renderHook } from '@testing-library/react'

import { useKeptQuotedTokensOrder } from './useKeptQuotedTokensOrder'

import { AAPLX_MAINNET } from '../lib/fixtures'
import { type QuotedToken, sortQuotedTokens } from '../lib/quotedTokens'

import type { RwaToken } from '@/entities/asset'

const AAPLON: RwaToken = { ...AAPLX_MAINNET, address: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c', symbol: 'AAPLon' }
const AAPLB: RwaToken = { ...AAPLX_MAINNET, address: '0x0000000000000000000000000000000000000aab', symbol: 'AAPLb' }

function sorted(prices: [RwaToken, number][]): QuotedToken[] {
  return sortQuotedTokens(
    prices.map(([token, pricePerShare]) => ({
      token,
      quote: { address: token.address, amount: '1', verified: true, error: null },
      pricePerShare,
      sharesPerToken: null,
      isPriceOutlier: false,
      stats: undefined,
    })),
    'buy',
  )
}

function symbols(quotedTokens: QuotedToken[]): string[] {
  return quotedTokens.map(({ token }) => token.symbol)
}

describe('useKeptQuotedTokensOrder', () => {
  const FIRST = sorted([
    [AAPLON, 100],
    [AAPLX_MAINNET, 101],
    [AAPLB, 102],
  ])
  const REFRESHED = sorted([
    [AAPLON, 100],
    [AAPLX_MAINNET, 102],
    [AAPLB, 101],
  ])

  it('keeps the rendered rows when a refresh swaps tokens after the best one', () => {
    const { result, rerender } = renderHook(({ tokens }) => useKeptQuotedTokensOrder(tokens, '1:buy'), {
      initialProps: { tokens: FIRST },
    })

    rerender({ tokens: REFRESHED })

    expect(symbols(result.current)).toEqual(['AAPLon', 'AAPLx', 'AAPLb'])
  })

  it('uses the new order on another network or side', () => {
    const { result, rerender } = renderHook(({ tokens, orderKey }) => useKeptQuotedTokensOrder(tokens, orderKey), {
      initialProps: { tokens: FIRST, orderKey: '1:buy' },
    })

    rerender({ tokens: REFRESHED, orderKey: '1:sell' })

    expect(symbols(result.current)).toEqual(['AAPLon', 'AAPLb', 'AAPLx'])
  })
})
