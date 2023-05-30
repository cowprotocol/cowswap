import { useCallback } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useSwapActionHandlers } from 'legacy/state/swap/hooks'

import { useSafeBundleApprovalFlowContext } from 'modules/swap/hooks/useSafeBundleApprovalFlowContext'
import { ethFlow } from 'modules/swap/services/ethFlow'
import { safeBundleApprovalFlow } from 'modules/swap/services/safeBundleFlow'
import { swapFlow } from 'modules/swap/services/swapFlow'
import { logTradeFlow } from 'modules/trade/utils/logger'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useEthFlowContext } from './useEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'

export function useHandleSwap(priceImpactParams: PriceImpact): () => Promise<void> {
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const safeBundleFlowContext = useSafeBundleApprovalFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const { onChangeRecipient } = useSwapActionHandlers()

  return useCallback(async () => {
    if (!swapFlowContext && !ethFlowContext && !safeBundleFlowContext) return

    if (safeBundleFlowContext) {
      logTradeFlow('SAFE BUNDLE FLOW', 'Start safe bundle flow')
      await safeBundleApprovalFlow(safeBundleFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
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
    safeBundleFlowContext,
    onChangeRecipient,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
  ])
}
