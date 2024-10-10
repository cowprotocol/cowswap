import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { useIsEoaEthFlow } from './useIsEoaEthFlow'
import { useIsSafeEthFlow } from './useIsSafeEthFlow'
import { useReceiveAmountInfo } from './useReceiveAmountInfo'

import { FlowType } from '../types'

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
