import { useIsEoaEthFlow, useIsSafeEthFlow, useReceiveAmountInfo } from 'modules/trade'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { FlowType } from '../types/TradeFlowContext'

export function useTradeFlowType(): FlowType {
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSafeEthFlow = useIsSafeEthFlow()
  const receiveAmountInfo = useReceiveAmountInfo()
  const inputAmountWithSlippage = receiveAmountInfo?.afterSlippage.sellAmount

  const isSafeBundle = useIsSafeApprovalBundle(inputAmountWithSlippage)
  return getFlowType(isSafeBundle, isEoaEthFlow, isSafeEthFlow)
}

function getFlowType(isSafeBundle: boolean, isEoaEthFlow: boolean, isSafeEthFlow: boolean): FlowType {
  if (isSafeEthFlow) {
    // Takes precedence over bundle approval
    return FlowType.SAFE_BUNDLE_ETH
  }
  if (isSafeBundle) {
    // Takes precedence over eth flow
    return FlowType.SAFE_BUNDLE_APPROVAL
  }
  if (isEoaEthFlow) {
    // Takes precedence over regular flow
    return FlowType.EOA_ETH_FLOW
  }
  return FlowType.REGULAR
}
