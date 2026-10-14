import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { getTokenKey } from './tokenKey'
import { resolveTradeToken } from './tradeToken'

import type { RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}
const TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET, AAPLX_ARBITRUM]
const GNOSIS_CHAIN_ID = 100

describe('resolveTradeToken', () => {
  it('falls back to the first token when disconnected and nothing is selected', () => {
    expect(resolveTradeToken(TOKENS, null, undefined)).toEqual({
      assetToken: AAPLX_MAINNET,
      chainTokens: [AAPLX_MAINNET, AAPLON_MAINNET],
    })
  })

  it('uses the selected token and its network when disconnected', () => {
    expect(resolveTradeToken(TOKENS, getTokenKey(AAPLX_ARBITRUM), undefined)).toEqual({
      assetToken: AAPLX_ARBITRUM,
      chainTokens: [AAPLX_ARBITRUM],
    })
  })

  it('uses the selected token on the wallet network', () => {
    expect(resolveTradeToken(TOKENS, getTokenKey(AAPLON_MAINNET), 1)?.assetToken).toBe(AAPLON_MAINNET)
  })

  it('keeps the wallet network until the wallet switches to the selected token network', () => {
    expect(resolveTradeToken(TOKENS, getTokenKey(AAPLX_ARBITRUM), 1)).toEqual({
      assetToken: AAPLX_MAINNET,
      chainTokens: [AAPLX_MAINNET, AAPLON_MAINNET],
    })
  })

  it('ignores the wallet network when the asset has no tokens there', () => {
    expect(resolveTradeToken(TOKENS, null, GNOSIS_CHAIN_ID)?.assetToken).toBe(AAPLX_MAINNET)
    expect(resolveTradeToken(TOKENS, getTokenKey(AAPLX_ARBITRUM), GNOSIS_CHAIN_ID)?.assetToken).toBe(AAPLX_ARBITRUM)
  })

  it('ignores a key of another asset', () => {
    expect(resolveTradeToken([AAPLX_ARBITRUM], getTokenKey(AAPLX_MAINNET), undefined)?.assetToken).toBe(AAPLX_ARBITRUM)
  })

  it('returns null for an asset without tokens', () => {
    expect(resolveTradeToken([], null, undefined)).toBeNull()
  })
})
