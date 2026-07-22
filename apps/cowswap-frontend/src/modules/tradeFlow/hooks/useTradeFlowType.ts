import { useIsTxBundlingSupported, useWalletDetails } from '@cowprotocol/wallet'

import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { useAmountsToSignFromQuote, useIsEoaEthFlow, useIsSafeEthFlow } from 'modules/trade'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { FlowType } from '../types/TradeFlowContext'

export function useTradeFlowType(): FlowType {
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSafeEthFlow = useIsSafeEthFlow()
  const isBundlingSupported = useIsTxBundlingSupported()
  const { allowsOffchainSigning } = useWalletDetails()
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}
  const isSafeBundle = useIsSafeApprovalBundle(maximumSendSellAmount)
  const { reason: approvalReason } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
    allowsOffchainSigning,
  })
  const isPermitRequired =
    approvalReason === ApproveRequiredReason.Eip2612PermitRequired ||
    approvalReason === ApproveRequiredReason.DaiLikePermitRequired

  return getFlowType(isSafeBundle, isEoaEthFlow, isSafeEthFlow, isPermitRequired)
}

function getFlowType(
  isSafeBundle: boolean,
  isEoaEthFlow: boolean,
  isSafeEthFlow: boolean,
  isPermitRequired: boolean,
): FlowType {
  if (isSafeEthFlow) {
    // Takes precedence over bundle approval
    return FlowType.SAFE_BUNDLE_ETH
  }
  if (isSafeBundle && !isPermitRequired) {
    // Takes precedence over eth flow
    return FlowType.SAFE_BUNDLE_APPROVAL
  }
  if (isEoaEthFlow) {
    // Takes precedence over regular flow
    return FlowType.EOA_ETH_FLOW
  }
  return FlowType.REGULAR
}
