import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

import { useGetPartialAmountToSignApprove } from './useGetPartialAmountToSignApprove'
import { useIsPartialApprovalModeSelected } from './useIsPartialApprovalModeSelected'

import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser } from '../state'

/**
 * Returns the amount to sign for the approval transaction/permit
 * If no approval is needed, it returns 0
 * Otherwise it checks if partial approval is enabled and selected by the user.
 * If so, it returns the partial amount to sign.
 * Otherwise, it returns the maximum approve amount (unlimited).
 */
export function useGetAmountToSignApprove(): CurrencyAmount<Currency> | null {
  const partialAmountToSign = useGetPartialAmountToSignApprove()
  const isApprovalNeeded = useNeedsApproval(partialAmountToSign)
  const isPartialApprovalSelectedByUser = useIsPartialApproveSelectedByUser()
  const { isPartialApproveEnabled } = useFeatureFlags()
  const isPartialApprovalEnabledInSettings = useIsPartialApprovalModeSelected()

  return useMemo(() => {
    if (!partialAmountToSign) return null

    if (!isApprovalNeeded) return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, '0')

    if (isPartialApproveEnabled && isPartialApprovalSelectedByUser && isPartialApprovalEnabledInSettings) {
      return partialAmountToSign
    }

    return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, MAX_APPROVE_AMOUNT.toString())
  }, [
    partialAmountToSign,
    isApprovalNeeded,
    isPartialApproveEnabled,
    isPartialApprovalSelectedByUser,
    isPartialApprovalEnabledInSettings,
  ])
}
