import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { PermitType } from '@cowprotocol/permit-utils'

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

export function useIsApprovalOrPermitRequired(): ApproveRequiredReason {
  const amountToApprove = useGetAmountToSignApprove()
  const { isPartialApproveEnabled } = useFeatureFlags()

  const { state: approvalState } = useApproveState(amountToApprove)
  const { inputCurrency, tradeType } = useDerivedTradeState() || {}

  const { type } = usePermitInfo(inputCurrency, tradeType) || {}

  const isPermitSupported = type && type !== 'unsupported'

  if (!isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)) {
    return ApproveRequiredReason.Required
  }

  // we use new approve/permit flow only for swaps for now
  if (tradeType !== TradeType.SWAP || !isPartialApproveEnabled) {
    return ApproveRequiredReason.NotRequired
  }

  return getPermitRequirements(type)
}

function getPermitRequirements(type?: PermitType): ApproveRequiredReason {
  if (type === 'dai-like') return ApproveRequiredReason.DaiLikePermitRequired
  if (type === 'eip-2612') return ApproveRequiredReason.Eip2612PermitRequired
  return ApproveRequiredReason.NotRequired
}
