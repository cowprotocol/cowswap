import { useCallback } from 'react'

import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useApprovalAnalytics } from './useApprovalAnalytics'

import { useUpdateApproveProgressModalState } from '../../state'

export function useHandleApprovalError(symbol: string | undefined): (error: unknown) => void {
  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const approvalAnalytics = useApprovalAnalytics()
  const { t } = useLingui()

  return useCallback(
    (error: unknown) => {
      console.error('Error setting the allowance for token', error)

      if (isRejectRequestProviderError(error)) {
        updateApproveProgressModalState({ error: t`User rejected approval transaction` })
      } else {
        const errorCode =
          error && typeof error === 'object' && 'code' in error && typeof error.code === 'number' ? error.code : null
        approvalAnalytics('Error', symbol, errorCode)
        updateApproveProgressModalState({ error: errorToString(error) })
      }
    },
    [updateApproveProgressModalState, t, approvalAnalytics, symbol],
  )
}
