import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

/**
 * False on Solana, where putting the order on-chain always costs SOL — the owner pays it, or the
 * funder does on a sponsored order. Either way the Tx cost row reports it, so a `FREE` fee row would
 * contradict the row right below it.
 */
export function useIsFreeOrderPlacement(): boolean {
  const { chainId } = useWalletInfo()

  return !isSolanaChain(chainId)
}
