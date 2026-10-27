import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from './useIsEoaEthFlow'

export function useShouldPayGas(): boolean {
  const { chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()

  // Solana placement always costs a transaction, but the Tx cost row already prices it in SOL,
  // and `allowsOffchainSigning` is an EVM signal that stays false there for want of a code lookup.
  if (isSolanaChain(chainId)) return false

  return isEoaEthFlow || !allowsOffchainSigning
}
