import { useCallback } from 'react'

import {
  captureError,
  ERROR_TYPES,
  extractErrorCode,
  isRejectRequestProviderError,
  normalizeError,
} from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useApprovalAnalytics } from './useApprovalAnalytics'

import { useUpdateApproveProgressModalState } from '../../state'

export function useHandleApprovalError(symbol: string | undefined): (error: unknown) => void {
  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const approvalAnalytics = useApprovalAnalytics()
  const { t } = useLingui()

  return useCallback(
    (err: unknown) => {
      const error = normalizeError(err)

      if (isRejectRequestProviderError(error)) {
        updateApproveProgressModalState({ error: t`User rejected approval transaction` })
      } else {
        captureError(error, ERROR_TYPES.ON_APPROVE)
        approvalAnalytics('Error', symbol, extractErrorCode(err))
        // Use shortMessage (viem) to avoid verbose error output with request arguments
        const displayMessage = ('shortMessage' in error ? error.shortMessage : error.message) as string
        updateApproveProgressModalState({ error: displayMessage })
      }
    },
    [updateApproveProgressModalState, t, approvalAnalytics, symbol],
  )
}
