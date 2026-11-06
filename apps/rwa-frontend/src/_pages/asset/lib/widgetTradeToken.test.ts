import { getAddressKey } from '@cowprotocol/cow-sdk'

import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { findWidgetTradeToken } from './widgetTradeToken'

import type { RwaToken } from '@/entities/asset'

type WidgetToken = Pick<RwaToken, 'chainId' | 'address' | 'symbol' | 'name' | 'decimals'>

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14C3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}
const USDC_MAINNET: WidgetToken = {
  chainId: 1,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
}
const MAINNET_TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET]

function toWidgetToken({ chainId, address, symbol, name, decimals }: RwaToken): WidgetToken {
  return { chainId, address: getAddressKey(address), symbol, name, decimals }
}

describe('findWidgetTradeToken', () => {
  it('finds the buy token on the buy side, whatever the address casing', () => {
    const params = { sellToken: USDC_MAINNET, buyToken: toWidgetToken(AAPLON_MAINNET) }

    expect(findWidgetTradeToken(params, 'buy', MAINNET_TOKENS)).toBe(AAPLON_MAINNET)
  })

  it('finds the sell token on the sell side', () => {
    const params = { sellToken: toWidgetToken(AAPLON_MAINNET), buyToken: USDC_MAINNET }

    expect(findWidgetTradeToken(params, 'sell', MAINNET_TOKENS)).toBe(AAPLON_MAINNET)
  })

  it('ignores a token of another network', () => {
    const params = { sellToken: USDC_MAINNET, buyToken: toWidgetToken(AAPLX_ARBITRUM) }

    expect(findWidgetTradeToken(params, 'buy', MAINNET_TOKENS)).toBeUndefined()
  })

  it('ignores a token that is not an asset token', () => {
    const params = { sellToken: USDC_MAINNET, buyToken: USDC_MAINNET }

    expect(findWidgetTradeToken(params, 'buy', MAINNET_TOKENS)).toBeUndefined()
  })

  it('ignores a payload without the token', () => {
    expect(findWidgetTradeToken({ sellToken: USDC_MAINNET }, 'buy', MAINNET_TOKENS)).toBeUndefined()
  })
})
