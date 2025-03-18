import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

// // Source chainId should always be a value from SupportedChainId
export function useSourceChainId(): SupportedChainId {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId, field, open } = useSelectTokenWidgetState()

  if (!open || field === Field.OUTPUT) return chainId

  return selectedTargetChainId
}
