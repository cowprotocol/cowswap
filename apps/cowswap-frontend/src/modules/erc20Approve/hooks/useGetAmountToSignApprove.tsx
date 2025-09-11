import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { MaxUint256 } from '@ethersproject/constants'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useGetPartialAmountToSignApprove } from './useGetPartialAmountToSignApprove'

import { useSwapPartialApprovalToggleState } from '../../swap/hooks/useSwapSettings'
import { useIsPartialApproveSelectedByUser } from '../state'

const MAX_APPROVE_AMOUNT = MaxUint256.toString()

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

    return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, MAX_APPROVE_AMOUNT)
  }, [
    partialAmountToSign,
    isPartialApproveEnabled,
    isPartialApprovalSelectedByUser,
    isPartialApprovalEnabledInSettings,
  ])
}
