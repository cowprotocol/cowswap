import { getRelatedAssets } from './relatedAssets'

import type { RwaAsset } from './types'

function asset(ticker: string, sector?: string, type: RwaAsset['type'] = 'stock'): RwaAsset {
  return {
    ticker,
    coingeckoId: ticker.toLowerCase(),
    title: `${ticker} Inc.`,
    type,
    priority: 0,
    profile: sector ? { description: `${ticker} description`, sector } : undefined,
    tokens: [],
  }
}

const SEMIS = 'Information Technology · Semiconductors'
const SOFTWARE = 'Information Technology · Software'

const ASSETS = [
  asset('NVDA', SEMIS),
  asset('AMD', SEMIS),
  asset('INTC', SEMIS),
  asset('MSFT', SOFTWARE),
  asset('XOM', 'Energy · Oil, Gas & Consumable Fuels'),
  asset('NOPROFILE'),
  asset('SPY', 'ETF · Equity', 'index'),
  asset('XAU', undefined, 'commodity'),
]

function tickers(target: RwaAsset, limit: number): string[] {
  return getRelatedAssets(target, ASSETS, limit).map(({ ticker }) => ticker)
}

describe('getRelatedAssets', () => {
  it('takes the next asset of its industry, sector and type, in ticker order and wrapping around', () => {
    expect(tickers(ASSETS[2], 3)).toEqual(['NVDA', 'MSFT', 'NOPROFILE'])
  })

  it('fills the other slots from the closest group first', () => {
    expect(tickers(ASSETS[0], 5)).toEqual(['AMD', 'INTC', 'MSFT', 'XOM', 'NOPROFILE'])
  })

  it('links every asset that shares a group with another one, even when it is alone in its industry', () => {
    const linked = new Set(ASSETS.flatMap((item) => tickers(item, 3)))

    expect(ASSETS.map(({ ticker }) => ticker).filter((ticker) => !linked.has(ticker))).toEqual(['SPY', 'XAU'])
  })

  it('never lists the asset itself or an asset twice', () => {
    const related = tickers(ASSETS[0], 10)

    expect(related).not.toContain('NVDA')
    expect(new Set(related).size).toBe(related.length)
  })

  it('returns nothing for the only asset of its type', () => {
    expect(tickers(ASSETS[7], 6)).toEqual([])
  })

  it('returns only the fields a link needs', () => {
    expect(getRelatedAssets(ASSETS[0], ASSETS, 1)).toEqual([{ ticker: 'AMD', title: 'AMD Inc.', logoUrl: undefined }])
  })
})
