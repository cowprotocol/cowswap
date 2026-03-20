import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

/**
 * Chain ID for the current context: wallet chain when connected, otherwise from URL (e.g. after returning from MM).
 * Use when rendering content that should stay visible even if wallet briefly disconnects.
 */
export function useEffectiveChainId(): SupportedChainId {
  const { chainId: walletChainId } = useWalletInfo()
  return walletChainId ?? getCurrentChainIdFromUrl()
}
