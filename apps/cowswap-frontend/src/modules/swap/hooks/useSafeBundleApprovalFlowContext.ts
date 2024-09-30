import { useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'

import { SafeBundleApprovalFlowContext } from 'modules/swap/services/types'

import { useTokenContract } from 'common/hooks/useContract'

import { useBaseSafeBundleFlowContext } from './useBaseSafeBundleFlowContext'

import { FlowType } from '../types/flowContext'

export function useSafeBundleApprovalFlowContext(): SafeBundleApprovalFlowContext | null {
  const baseContext = useBaseSafeBundleFlowContext()
  const trade = baseContext?.context.trade

  const sellToken = trade ? getWrappedToken(trade.inputAmount.currency) : undefined
  const erc20Contract = useTokenContract(sellToken?.address)

  return useMemo(() => {
    if (
      !baseContext ||
      !baseContext.context.trade ||
      !erc20Contract ||
      baseContext.context.flowType !== FlowType.SAFE_BUNDLE_APPROVAL
    ) {
      return null
    }

    return {
      ...baseContext,
      erc20Contract,
    }
  }, [baseContext, erc20Contract])
}
