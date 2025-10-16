import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { PermitType } from '@cowprotocol/permit-utils'
import { Nullish } from '@cowprotocol/types'

import { usePermitInfo } from 'modules/permit'
import { TradeType, useDerivedTradeState } from 'modules/trade'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'

import { ApprovalState } from '../types'

export enum ApproveRequiredReason {
  NotRequired,
  Required,
  Eip2612PermitRequired,
  DaiLikePermitRequired,
}

export function useIsApprovalOrPermitRequired(): { reason: ApproveRequiredReason; currentAllowance: Nullish<bigint> } {
  const amountToApprove = useGetAmountToSignApprove()
  const { isPartialApproveEnabled } = useFeatureFlags()
  const { state: approvalState, currentAllowance } = useApproveState(amountToApprove)
  const { inputCurrency, tradeType } = useDerivedTradeState() || {}
  const { type } = usePermitInfo(inputCurrency, tradeType) || {}

  const reason = (() => {
    if (amountToApprove?.equalTo('0')) {
      return ApproveRequiredReason.NotRequired
    }

    const isPermitSupported = type !== 'unsupported'

    if (!isPermitSupported && isApprovalRequired(approvalState)) {
      return ApproveRequiredReason.Required
    }

    if (!isNewApproveFlowEnabled(tradeType, isPartialApproveEnabled)) {
      return ApproveRequiredReason.NotRequired
    }

    return getPermitRequirements(type)
  })()

  return useMemo(() => ({ reason, currentAllowance }), [reason, currentAllowance])
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
