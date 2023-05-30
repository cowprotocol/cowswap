import { useWETHContract } from 'legacy/hooks/useContract'

import { FlowType } from 'modules/swap/hooks/useFlowContext'
import { SafeBundleEthFlowContext } from 'modules/swap/services/types'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

import { useBaseSafeBundleFlowContext } from './useBaseSafeBundleFlowContext'

export function useSafeBundleEthFlowContext(): SafeBundleEthFlowContext | null {
  const baseContext = useBaseSafeBundleFlowContext()
  const trade = baseContext?.context.trade

  const wrappedNativeContract = useWETHContract()
  const needsApproval = useNeedsApproval(baseContext?.context.inputAmountWithSlippage)

  if (!trade || !wrappedNativeContract) return null

  if (!baseContext || baseContext.context.flowType !== FlowType.SAFE_BUNDLE_ETH) return null

  return {
    ...baseContext,
    wrappedNativeContract,
    needsApproval,
  }
}
