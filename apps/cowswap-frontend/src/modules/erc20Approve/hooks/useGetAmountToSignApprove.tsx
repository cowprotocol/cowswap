import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'
import { useDerivedTradeState } from 'modules/trade'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { TradeType } from 'common/modules/tradeNavigation'

import { useGetPartialAmountToSignApprove } from './useGetPartialAmountToSignApprove'
import { useIsPartialApprovalModeSelected } from './useIsPartialApprovalModeSelected'

import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser } from '../state'

const PARTIAL_APPROVAL_SUPPORTED_TRADE_TYPES: TradeType[] = [
  TradeType.SWAP,
  TradeType.LIMIT_ORDER,
  TradeType.ADVANCED_ORDERS,
]

/**
 * Returns the amount to sign for the approval transaction/permit
 * If no approval is needed, it returns 0
 * Otherwise it checks if partial approval is enabled and selected by the user
 * (supported trade types only, see PARTIAL_APPROVAL_SUPPORTED_TRADE_TYPES).
 * If so, it returns the partial amount to sign.
 * Otherwise, it returns the maximum approve amount (unlimited).
 */
export function useGetAmountToSignApprove(): CurrencyAmount<Currency> | null {
  const partialAmountToSign = useGetPartialAmountToSignApprove()
  const isApprovalNeeded = useNeedsApproval(partialAmountToSign)
  const isPartialApprovalSelectedByUser = useIsPartialApproveSelectedByUser()
  const isPartialApprovalEnabledInSettings = useIsPartialApprovalModeSelected()
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabledInWidget()
  const { tradeType } = useDerivedTradeState() || {}
  const isPartialApprovalSelected =
    !!tradeType &&
    PARTIAL_APPROVAL_SUPPORTED_TRADE_TYPES.includes(tradeType) &&
    isPartialApprovalSelectedByUser &&
    isPartialApprovalEnabledInSettings

  return useMemo(() => {
    if (!partialAmountToSign) return null

    if (!isApprovalNeeded) return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, '0')

    if (isInfiniteApproveDisabled) {
      return partialAmountToSign
    }

    if (isPartialApprovalSelected) {
      return partialAmountToSign
    }

    return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, MAX_APPROVE_AMOUNT.toString())
  }, [partialAmountToSign, isApprovalNeeded, isPartialApprovalSelected, isInfiniteApproveDisabled])
}
