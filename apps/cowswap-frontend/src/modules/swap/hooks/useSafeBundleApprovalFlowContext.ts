import { getWrappedToken } from '@cowprotocol/common-utils'

import { FlowType } from 'modules/swap/hooks/useFlowContext'
import { SafeBundleApprovalFlowContext } from 'modules/swap/services/types'

import { useTokenContract } from 'common/hooks/useContract'

import { useBaseSafeBundleFlowContext } from './useBaseSafeBundleFlowContext'

export function useSafeBundleApprovalFlowContext(): SafeBundleApprovalFlowContext | null {
  const baseContext = useBaseSafeBundleFlowContext()
  const trade = baseContext?.context.trade

  const sellToken = trade ? getWrappedToken(trade.inputAmount.currency) : undefined
  const erc20Contract = useTokenContract(sellToken?.address)

  if (!trade || !erc20Contract) return null

  if (!baseContext || baseContext.context.flowType !== FlowType.SAFE_BUNDLE_APPROVAL) return null

  return {
    ...baseContext,
    erc20Contract,
  }
}
