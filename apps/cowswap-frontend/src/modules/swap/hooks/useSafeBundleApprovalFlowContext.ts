import { useTokenContract } from 'legacy/hooks/useContract'

import { FlowType } from 'modules/swap/hooks/useFlowContext'
import { SafeBundleApprovalFlowContext } from 'modules/swap/services/types'

import { useBaseSafeBundleFlowContext } from './useBaseSafeBundleFlowContext'

export function useSafeBundleApprovalFlowContext(): SafeBundleApprovalFlowContext | null {
  const baseContext = useBaseSafeBundleFlowContext()
  const trade = baseContext?.context.trade

  const sellToken = trade ? trade.inputAmount.currency.wrapped : undefined
  const erc20Contract = useTokenContract(sellToken?.address)

  if (!trade || !erc20Contract) return null

  if (!baseContext || baseContext.context.flowType !== FlowType.SAFE_BUNDLE_APPROVAL) return null

  return {
    ...baseContext,
    erc20Contract,
  }
}
