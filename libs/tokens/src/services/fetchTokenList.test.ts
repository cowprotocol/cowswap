import { fetchTokenList } from './fetchTokenList'

import { ListSourceConfig } from '../types'

const SOLANA_TOKEN_LIST = {
  name: 'Solana Default',
  timestamp: '2026-07-14T11:28:18.555Z',
  version: { major: 1, minor: 0, patch: 1 },
  tokens: [
    {
      chainId: 1000000001,
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
  ],
}

const SOLANA_LIST_SOURCE: ListSourceConfig = {
  priority: 1,
  source: 'https://files.cow.fi/token-lists/SolanaDefault.json',
}

describe('fetchTokenList', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('keeps Solana tokens instead of rejecting them against the EVM-only schema', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(SOLANA_TOKEN_LIST),
    } as Response)

    const result = await fetchTokenList(SOLANA_LIST_SOURCE)

    expect(result.list.tokens).toHaveLength(1)
    expect(result.list.tokens[0].address).toBe(SOLANA_TOKEN_LIST.tokens[0].address)
  })
})
