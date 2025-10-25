import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { UNISWAP_TOKEN_LIST_URL } from './uniswapTokenListUrls'

describe('UNISWAP_TOKEN_LIST_URL', () => {
  it('provides a token list URL for every supported chain key in the map', () => {
    Object.keys(UNISWAP_TOKEN_LIST_URL).forEach((key) => {
      const chainId = Number(key) as SupportedChainId
      const url = UNISWAP_TOKEN_LIST_URL[chainId]

      expect(typeof url).toBe('string')
      expect(url.length).toBeGreaterThan(0)
    })
  })

  it('returns the canonical mainnet URL', () => {
    expect(UNISWAP_TOKEN_LIST_URL[SupportedChainId.MAINNET]).toBe('https://ipfs.io/ipns/tokens.uniswap.org')
  })
})
