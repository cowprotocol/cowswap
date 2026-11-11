import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from './useIsEoaEthFlow'
import { useIsSwapEth } from './useIsSwapEth'

export enum GasPaymentReason {
  EthFlow = 'eth-flow',
  SmartContractWallet = 'smart-contract-wallet',
}

export function useGasPaymentReason(): GasPaymentReason | null {
  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSwapEth = useIsSwapEth()

  // Solana placement always costs a transaction, but the Tx cost row already prices it in SOL,
  // and `allowsOffchainSigning` is an EVM signal that stays false there for want of a code lookup.
  if (isSolanaChain(chainId)) return null

  if (!account) return isSwapEth ? GasPaymentReason.EthFlow : null

  if (isEoaEthFlow) return GasPaymentReason.EthFlow

  return allowsOffchainSigning ? null : GasPaymentReason.SmartContractWallet
}
