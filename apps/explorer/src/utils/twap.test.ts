import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TWAP_SUPPORTED_CHAIN_IDS, isTwapEventId, isTwapSupportedChain } from './twap'

const EVENT_ID = '169175034500000000000001000000000029407131000000000000001050000000000000048'

describe('TWAP Explorer support', () => {
  it('supports the ten production EVM chains and Sepolia', () => {
    expect(TWAP_SUPPORTED_CHAIN_IDS).toHaveLength(11)
    expect(isTwapSupportedChain(SupportedChainId.MAINNET)).toBe(true)
    expect(isTwapSupportedChain(SupportedChainId.SEPOLIA)).toBe(true)
    expect(isTwapSupportedChain(SupportedChainId.SOLANA)).toBe(false)
  })

  it('recognizes encoded decimal event IDs', () => {
    expect(isTwapEventId(EVENT_ID)).toBe(true)
    expect(isTwapEventId('123')).toBe(false)
    expect(isTwapEventId(`${EVENT_ID}a`)).toBe(false)
  })
})
