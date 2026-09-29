import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { USDC } from './tokens'

describe('USDC', () => {
  it('uses USDC.e on Gnosis Chain', () => {
    expect(USDC[SupportedChainId.GNOSIS_CHAIN]).toMatchObject({
      address: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
      symbol: 'USDC.e',
    })
  })
})
