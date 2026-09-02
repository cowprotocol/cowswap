import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getRwaDefaultCurrencyIds } from './getRwaDefaultCurrencyIds'

describe('getRwaDefaultCurrencyIds', () => {
  it('returns USDC and AAPLON on a chain configured with the Ondo list', () => {
    expect(getRwaDefaultCurrencyIds(SupportedChainId.MAINNET, true)).toEqual({
      inputCurrencyId: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      outputCurrencyId: 'AAPLON',
    })
  })

  it('returns no override on a chain without the Ondo list', () => {
    expect(getRwaDefaultCurrencyIds(SupportedChainId.GNOSIS_CHAIN, true)).toBeUndefined()
  })

  it('returns no override when the Ondo list is explicitly disabled', () => {
    expect(getRwaDefaultCurrencyIds(SupportedChainId.MAINNET, false)).toBeUndefined()
  })
})
