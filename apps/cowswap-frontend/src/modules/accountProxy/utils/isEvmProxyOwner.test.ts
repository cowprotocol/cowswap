import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isEvmProxyOwner } from './isEvmProxyOwner'

const EVM_ACCOUNT = '0xa0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const SOLANA_ACCOUNT = '4B89hPSCqEp5xkKyhjuMg48phEJqzUt4vkdmmLJv5s1D'

describe('isEvmProxyOwner', () => {
  it('accepts an EVM account on an EVM chain', () => {
    expect(isEvmProxyOwner(EVM_ACCOUNT, SupportedChainId.MAINNET)).toBe(true)
  })

  // Selecting an EVM chain does not disconnect a Solana wallet, so `walletInfo` can pair chain 1
  // with a base58 account. `proxyOf` ABI-encodes it as an `address` and throws, which crashed the
  // trade form (FE-710). The chain check alone passes here, so the account has to be checked too.
  it('rejects a Solana account even when the selected chain is EVM', () => {
    expect(isEvmProxyOwner(SOLANA_ACCOUNT, SupportedChainId.MAINNET)).toBe(false)
  })

  it('rejects an EVM account on a non-EVM chain', () => {
    expect(isEvmProxyOwner(EVM_ACCOUNT, SupportedChainId.SOLANA)).toBe(false)
  })

  it('rejects a missing account', () => {
    expect(isEvmProxyOwner(undefined, SupportedChainId.MAINNET)).toBe(false)
  })
})
