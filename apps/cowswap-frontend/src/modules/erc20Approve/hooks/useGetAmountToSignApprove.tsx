import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useGetPartialAmountToSignApprove } from './useGetPartialAmountToSignApprove'

import { useSwapPartialApprovalToggleState } from '../../swap/hooks/useSwapSettings'
import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser } from '../state'

/**
 * Returns the amount to sign for the approval transaction/permit
 * It checks if partial approval is enabled and selected by the user.
 * If so, it returns the partial amount to sign.
 * Otherwise, it returns the maximum approve amount (unlimited).
 */
export function useGetAmountToSignApprove(): CurrencyAmount<Currency> | null {
  const partialAmountToSign = useGetPartialAmountToSignApprove()
  const isPartialApprovalSelectedByUser = useIsPartialApproveSelectedByUser()
  const { isPartialApproveEnabled } = useFeatureFlags()
  const [isPartialApprovalEnabledInSettings] = useSwapPartialApprovalToggleState(isPartialApproveEnabled)

  return useMemo(() => {
    if (!partialAmountToSign) return null

    if (isPartialApproveEnabled && isPartialApprovalSelectedByUser && isPartialApprovalEnabledInSettings) {
      return partialAmountToSign
    }

    return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, MAX_APPROVE_AMOUNT.toString())
  }, [
    partialAmountToSign,
    isPartialApproveEnabled,
    isPartialApprovalSelectedByUser,
    isPartialApprovalEnabledInSettings,
  ])
}
