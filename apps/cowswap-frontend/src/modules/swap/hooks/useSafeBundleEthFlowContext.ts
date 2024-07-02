import { useMemo } from 'react'

import { FlowType } from 'modules/swap/hooks/useFlowContext'
import { SafeBundleEthFlowContext } from 'modules/swap/services/types'

import { useWETHContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

import { useBaseSafeBundleFlowContext } from './useBaseSafeBundleFlowContext'

export function useSafeBundleEthFlowContext(): SafeBundleEthFlowContext | null {
  const baseContext = useBaseSafeBundleFlowContext()

  const wrappedNativeContract = useWETHContract()
  const needsApproval = useNeedsApproval(baseContext?.context.inputAmountWithSlippage)

  return useMemo(() => {
    if (!wrappedNativeContract || !baseContext || baseContext.context.flowType !== FlowType.SAFE_BUNDLE_ETH) return null

    return {
      ...baseContext,
      wrappedNativeContract,
      needsApproval,
    }
  }, [baseContext, wrappedNativeContract, needsApproval])
}
