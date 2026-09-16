import { EvmChains, SupportedChainId } from '@cowprotocol/cow-sdk'

import { COMPOSABLE_COW_POLLER_ADDRESS } from './composable-cow-poller.constants'

describe('COMPOSABLE_COW_POLLER_ADDRESS', () => {
  it('does not define a poller address on Solana', () => {
    expect(SupportedChainId.SOLANA in COMPOSABLE_COW_POLLER_ADDRESS).toBe(false)
  })

  it('defines the poller address on EVM chains', () => {
    expect(COMPOSABLE_COW_POLLER_ADDRESS[EvmChains.MAINNET]).toBe('0x8c1cdDC5c012A2c84D531855f3946D927FE38E1E')
  })
})
