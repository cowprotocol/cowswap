import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { getTokenKey } from './tokenKey'
import { resolveTradeChainId, resolveTradeToken } from './tradeToken'

import type { RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}
const TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET, AAPLX_ARBITRUM]
const MAINNET_TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET]
const ARBITRUM = 42161
const GNOSIS_CHAIN_ID = 100

describe('resolveTradeChainId', () => {
  it('falls back to the first token network', () => {
    expect(resolveTradeChainId(TOKENS, null, null, undefined)).toBe(1)
  })

  it('uses the network picked in the selector when disconnected', () => {
    expect(resolveTradeChainId(TOKENS, null, ARBITRUM, undefined)).toBe(ARBITRUM)
  })

  it('uses the selected token network when disconnected', () => {
    expect(resolveTradeChainId(TOKENS, getTokenKey(AAPLX_ARBITRUM), null, undefined)).toBe(ARBITRUM)
  })

  it('keeps the wallet network until the wallet switches', () => {
    expect(resolveTradeChainId(TOKENS, getTokenKey(AAPLX_ARBITRUM), ARBITRUM, 1)).toBe(1)
  })

  it('ignores a wallet network without asset tokens', () => {
    expect(resolveTradeChainId(TOKENS, null, ARBITRUM, GNOSIS_CHAIN_ID)).toBe(ARBITRUM)
    expect(resolveTradeChainId(TOKENS, null, GNOSIS_CHAIN_ID, undefined)).toBe(1)
  })

  it('ignores a key of another asset', () => {
    expect(resolveTradeChainId([AAPLX_ARBITRUM], getTokenKey(AAPLX_MAINNET), null, undefined)).toBe(ARBITRUM)
  })

  it('returns undefined for an asset without tokens', () => {
    expect(resolveTradeChainId([], null, null, undefined)).toBeUndefined()
  })
})

describe('resolveTradeToken', () => {
  it('uses the token picked by the user', () => {
    expect(resolveTradeToken(MAINNET_TOKENS, getTokenKey(AAPLX_MAINNET), AAPLON_MAINNET.address)).toEqual({
      assetToken: AAPLX_MAINNET,
      isAutoSelected: false,
    })
  })

  it('picks the best quote automatically', () => {
    expect(resolveTradeToken(MAINNET_TOKENS, null, AAPLON_MAINNET.address.toLowerCase())).toEqual({
      assetToken: AAPLON_MAINNET,
      isAutoSelected: true,
    })
  })

  it('falls back to the first token without quotes or with a selection on another network', () => {
    expect(resolveTradeToken(MAINNET_TOKENS, getTokenKey(AAPLX_ARBITRUM), null)).toEqual({
      assetToken: AAPLX_MAINNET,
      isAutoSelected: true,
    })
  })

  it('returns null without tokens', () => {
    expect(resolveTradeToken([], null, null)).toBeNull()
  })
})
