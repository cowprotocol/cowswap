import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { useAddressResolution } from './useAddressResolution'
import { useReceiverChainInfo } from './useReceiverChainInfo'

export interface ReceiverValidation {
  loading: boolean
  isEmpty: boolean
  isValid: boolean
  isError: boolean
  explorerUrl: string | null
}

export function useReceiverValidation(value: string, targetChainId?: TargetChainId): ReceiverValidation {
  const { chainId, isNonEvm, strategy } = useReceiverChainInfo(targetChainId)
  const { address, loading, name } = useAddressResolution(value, targetChainId)

  const isEmpty = value.length === 0
  const isValid = Boolean(address)
  const isError = !isEmpty && !loading && !isValid
  const explorerUrl =
    isValid && (isNonEvm || strategy.supportsENS)
      ? getBlockExplorerUrl(chainId, 'address', name ?? address ?? '')
      : null

  return { loading, isEmpty, isValid, isError, explorerUrl }
}
