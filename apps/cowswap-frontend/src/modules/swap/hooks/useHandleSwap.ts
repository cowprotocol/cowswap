import { useCallback } from 'react'

import { PriceImpact } from '../../../legacy/hooks/usePriceImpact'
import { useSwapActionHandlers } from '../../../legacy/state/swap/hooks'

import { useSafeBundleApprovalFlowContext } from './useSafeBundleApprovalFlowContext'
import { ethFlow } from '../services/ethFlow'
import { safeBundleApprovalFlow, safeBundleEthFlow } from '../services/safeBundleFlow'
import { swapFlow } from '../services/swapFlow'
import { logTradeFlow } from '../../trade/utils/logger'

import { useConfirmPriceImpactWithoutFee } from '../../../common/hooks/useConfirmPriceImpactWithoutFee'

import { useEthFlowContext } from './useEthFlowContext'
import { useSafeBundleEthFlowContext } from './useSafeBundleEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'

export function useHandleSwap(priceImpactParams: PriceImpact): () => Promise<void> {
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const safeBundleApprovalFlowContext = useSafeBundleApprovalFlowContext()
  const safeBundleEthFlowContext = useSafeBundleEthFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const { onChangeRecipient } = useSwapActionHandlers()

  return useCallback(async () => {
    if (!swapFlowContext && !ethFlowContext && !safeBundleApprovalFlowContext && !safeBundleEthFlowContext) return

    if (safeBundleApprovalFlowContext) {
      logTradeFlow('SAFE BUNDLE APPROVAL FLOW', 'Start safe bundle approval flow')
      await safeBundleApprovalFlow(safeBundleApprovalFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    } else if (safeBundleEthFlowContext) {
      logTradeFlow('SAFE BUNDLE ETH FLOW', 'Start safe bundle eth flow')
      await safeBundleEthFlow(safeBundleEthFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    } else if (swapFlowContext) {
      logTradeFlow('SWAP FLOW', 'Start swap flow')
      await swapFlow(swapFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    } else if (ethFlowContext) {
      logTradeFlow('ETH FLOW', 'Start eth flow')
      await ethFlow(ethFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    }

    onChangeRecipient(null)
  }, [
    swapFlowContext,
    ethFlowContext,
    safeBundleApprovalFlowContext,
    safeBundleEthFlowContext,
    onChangeRecipient,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
  ])
}
