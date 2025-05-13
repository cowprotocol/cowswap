import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

export function useSourceChainId(): SupportedChainId {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId, open } = useSelectTokenWidgetState()

  // Source chainId should always be a value from SupportedChainId
  if (!open || !(selectedTargetChainId in SupportedChainId)) return chainId

  return selectedTargetChainId
}
