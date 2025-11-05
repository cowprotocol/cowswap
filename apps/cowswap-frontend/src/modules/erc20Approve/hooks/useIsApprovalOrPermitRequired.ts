import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { PermitType } from '@cowprotocol/permit-utils'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { usePermitInfo } from 'modules/permit'
import { TradeType, useDerivedTradeState } from 'modules/trade'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'

import { ApprovalState } from '../types'

export enum ApproveRequiredReason {
  Unsupported, // f.e. eth flow without bundling or for limit orders
  NotRequired,
  Required,
  Eip2612PermitRequired,
  DaiLikePermitRequired,
  BundleApproveRequired,
}

type AdditionalParams = {
  // null is needed to prevent breaking changes, as this param was optional before
  // f.e. for approve and swap its allowed, but for just approve - no
  isBundlingSupportedOrEnabledForContext: boolean | null
}

export function useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext }: AdditionalParams): {
  reason: ApproveRequiredReason
  currentAllowance: Nullish<bigint>
} {
  const amountToApprove = useGetAmountToSignApprove()
  const { isPartialApproveEnabled } = useFeatureFlags()
  const { state: approvalState, currentAllowance } = useApproveState(amountToApprove)
  const { inputCurrency, tradeType } = useDerivedTradeState() || {}
  const { type } = usePermitInfo(inputCurrency, tradeType) || {}

  const reason = (() => {
    if (!isApproveSupportedByFlowOrWallet(inputCurrency, tradeType, !!isBundlingSupportedOrEnabledForContext)) {
      return ApproveRequiredReason.Unsupported
    }

    if (!isErc20TokenAmountApproveRequired(amountToApprove)) {
      return ApproveRequiredReason.NotRequired
    }

    const isPermitSupported = type && type !== 'unsupported'

    if (!isPermitSupported && isApprovalRequired(approvalState)) {
      return isBundlingSupportedOrEnabledForContext
        ? ApproveRequiredReason.BundleApproveRequired
        : ApproveRequiredReason.Required
    }

    if (isBundlingSupportedOrEnabledForContext) return ApproveRequiredReason.BundleApproveRequired

    if (!isNewApproveFlowEnabled(tradeType, isPartialApproveEnabled)) {
      return ApproveRequiredReason.NotRequired
    }

    return getPermitRequirements(type)
  })()

  return useMemo(() => ({ reason, currentAllowance }), [reason, currentAllowance])
}

function isApproveSupportedByFlowOrWallet(
  inputCurrency: Nullish<Currency>,
  tradeType: Nullish<TradeType>,
  isBundlingSupportedOrEnabledForContext: boolean,
): boolean {
  const isNativeFlow = !!inputCurrency && getIsNativeToken(inputCurrency)
  if (!isNativeFlow) return true

  const isSwap = tradeType === TradeType.SWAP
  return isSwap ? isBundlingSupportedOrEnabledForContext : false
}

function isErc20TokenAmountApproveRequired(amountToApprove: CurrencyAmount<Currency> | null): boolean {
  if (!amountToApprove) return false
  return !amountToApprove.equalTo('0')
}

function isApprovalRequired(approvalState: ApprovalState): boolean {
  return approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING
}

function isNewApproveFlowEnabled(tradeType?: Nullish<TradeType>, isPartialApproveEnabled?: boolean): boolean {
  return tradeType === TradeType.SWAP && isPartialApproveEnabled === true
}

function getPermitRequirements(type?: PermitType): ApproveRequiredReason {
  switch (type) {
    case 'dai-like':
      return ApproveRequiredReason.DaiLikePermitRequired
    case 'eip-2612':
      return ApproveRequiredReason.Eip2612PermitRequired
    default:
      return ApproveRequiredReason.NotRequired
  }
}
