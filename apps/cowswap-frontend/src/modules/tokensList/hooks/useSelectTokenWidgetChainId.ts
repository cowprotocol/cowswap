import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

export function useSelectTokenWidgetChainId(): number {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId } = useSelectTokenWidgetState()

  return selectedTargetChainId
}
