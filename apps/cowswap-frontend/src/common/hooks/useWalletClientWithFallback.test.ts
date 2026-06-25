import { EvmChains } from '@cowprotocol/cow-sdk'

import { createInjectedWalletClient } from './useWalletClientWithFallback'

import type { EIP1193Provider } from 'viem'

const ACCOUNT = '0xD3a9cc6645cAF5A6885ddc9b0c09Dd760a7DB053'

describe('createInjectedWalletClient', () => {
  it('builds a wallet client from an injected provider', () => {
    const walletClient = createInjectedWalletClient({
      chainId: EvmChains.GNOSIS_CHAIN,
      account: ACCOUNT,
      provider: createProvider(),
    })

    expect(walletClient?.account?.address).toBe(ACCOUNT)
    expect(walletClient?.chain?.id).toBe(EvmChains.GNOSIS_CHAIN)
  })

  it('does not build a client without a valid account', () => {
    const walletClient = createInjectedWalletClient({
      chainId: EvmChains.GNOSIS_CHAIN,
      account: 'not-an-address',
      provider: createProvider(),
    })

    expect(walletClient).toBeUndefined()
  })

  it('does not build a client without a provider', () => {
    const walletClient = createInjectedWalletClient({
      chainId: EvmChains.GNOSIS_CHAIN,
      account: ACCOUNT,
    })

    expect(walletClient).toBeUndefined()
  })
})

function createProvider(): EIP1193Provider {
  return {
    request: jest.fn(),
  } as EIP1193Provider
}
