/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

import { buildLlmsTxt, getLlmsTxtHandler } from './llmsTxt'

import type { RwaAsset } from '@/entities/asset'

const ASSET: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'apple',
  title: 'Apple',
  type: 'stock',
  priority: 10,
  tokens: [
    {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000001',
      symbol: 'AAPLON',
      name: 'Apple (Ondo Tokenized Stock)',
      decimals: 18,
      issuer: 'Ondo',
      coingeckoId: 'apple-ondo-tokenized-stock',
    },
    {
      chainId: 56,
      address: '0x0000000000000000000000000000000000000002',
      symbol: 'AAPLON',
      name: 'Apple (Ondo Tokenized Stock)',
      decimals: 18,
      issuer: 'Ondo',
      coingeckoId: 'apple-ondo-tokenized-stock',
    },
    {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000003',
      symbol: 'AAPLX',
      name: 'Apple xStock',
      decimals: 18,
      issuer: 'xStocks',
      coingeckoId: 'apple-xstock',
    },
  ],
}

const ORIGIN = 'https://rwa.example'

describe('buildLlmsTxt', () => {
  it('starts with the title and summary', () => {
    expect(buildLlmsTxt([ASSET], ORIGIN).split('\n').slice(0, 3)).toEqual([
      '# CoW RWA',
      '',
      '> Trade tokenized stocks and ETFs with CoW Protocol',
    ])
  })

  it('lists every asset once with its type and issuers', () => {
    const llmsTxt = buildLlmsTxt([ASSET, { ...ASSET, ticker: 'SPY', title: 'SPDR S&P 500', type: 'index' }], ORIGIN)

    expect(llmsTxt).toContain('- [Apple (AAPL)](https://rwa.example/asset/AAPL): Stock, Ondo, xStocks\n')
    expect(llmsTxt).toContain('- [SPDR S&P 500 (SPY)](https://rwa.example/asset/SPY): ETF, Ondo, xStocks\n')
    expect(llmsTxt).toContain('CoW RWA lists 2 real-world assets tokenized by Ondo, xStocks on Ethereum, BNB')
  })

  it('links only absolute URLs', () => {
    const urls = [...buildLlmsTxt([ASSET], ORIGIN).matchAll(/\]\(([^)]+)\)/g)].map(([, url]) => url)

    expect(urls.length).toBeGreaterThan(0)
    expect(urls.filter((url) => !url.startsWith('https://'))).toEqual([])
  })

  it('puts only link lists under H2 sections', () => {
    const [, ...sections] = buildLlmsTxt([ASSET], ORIGIN).split(/^## /m)
    const lines = sections.flatMap((section) => section.split('\n').slice(1).filter(Boolean))

    expect(lines.filter((line) => !/^- \[[^\]]+\]\([^)]+\)/.test(line))).toEqual([])
  })

  it('does not link the API routes', () => {
    expect(buildLlmsTxt([ASSET], ORIGIN)).not.toContain('/api/')
  })
})

describe('getLlmsTxtHandler', () => {
  it('serves cached Markdown with links on the request origin', async () => {
    const response = getLlmsTxtHandler(new NextRequest('https://rwa.example/llms.txt'))

    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=3600')
    expect(await response.text()).toContain('- [Portfolio](https://rwa.example/portfolio)')
  })
})
