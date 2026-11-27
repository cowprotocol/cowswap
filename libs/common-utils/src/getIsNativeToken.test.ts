import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

describe('getIsNativeToken', () => {
  it('does not treat an ERC20 token as native only because it uses the native symbol', () => {
    const fakeEth = new Token(
      SupportedChainId.MAINNET,
      '0x1234567890123456789012345678901234567890',
      18,
      'ETH',
      'Fake ETH',
    )

    expect(getIsNativeToken(fakeEth)).toBe(false)
  })

  it('treats the canonical native token object as native', () => {
    expect(getIsNativeToken(NATIVE_CURRENCIES[SupportedChainId.MAINNET])).toBe(true)
  })

  it('keeps symbol matching for route token ids', () => {
    expect(getIsNativeToken(SupportedChainId.MAINNET, 'ETH')).toBe(true)
  })
})
