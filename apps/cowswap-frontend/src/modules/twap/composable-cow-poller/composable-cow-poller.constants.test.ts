import { EvmChains, SupportedChainId } from '@cowprotocol/cow-sdk'

import { COMPOSABLE_COW_POLLER_ADDRESS } from './composable-cow-poller.constants'

describe('COMPOSABLE_COW_POLLER_ADDRESS', () => {
  it('does not define a poller address on Solana', () => {
    expect(SupportedChainId.SOLANA in COMPOSABLE_COW_POLLER_ADDRESS).toBe(false)
  })

  it('defines the poller address on EVM chains', () => {
    expect(COMPOSABLE_COW_POLLER_ADDRESS[EvmChains.MAINNET]).toBe('0xd8088f0d57dB91AC6404FB3a9723A890100a6bB3')
  })
})
