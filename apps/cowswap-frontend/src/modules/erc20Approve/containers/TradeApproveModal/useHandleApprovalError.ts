import { useCallback } from 'react'

import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { useApprovalAnalytics } from './useApprovalAnalytics'

import { useUpdateTradeApproveState } from '../../state'

export function useHandleApprovalError(symbol: string | undefined): (error: unknown) => void {
  const updateTradeApproveState = useUpdateTradeApproveState()
  const approvalAnalytics = useApprovalAnalytics()

  return useCallback(
    (error: unknown) => {
      console.error('Error setting the allowance for token', error)

      if (isRejectRequestProviderError(error)) {
        updateTradeApproveState({ error: 'User rejected approval transaction' })
      } else {
        const errorCode =
          error && typeof error === 'object' && 'code' in error && typeof error.code === 'number' ? error.code : null
        approvalAnalytics('Error', symbol, errorCode)
        updateTradeApproveState({ error: errorToString(error) })
      }
    },
    [updateTradeApproveState, approvalAnalytics, symbol],
  )
}
