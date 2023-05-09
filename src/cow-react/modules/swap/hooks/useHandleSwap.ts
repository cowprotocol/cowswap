import { PriceImpact } from 'hooks/usePriceImpact'
import { useSwapFlowContext } from './useSwapFlowContext'
import { useEthFlowContext } from './useEthFlowContext'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { useCallback } from 'react'
import { logTradeFlow } from '@cow/modules/trade/utils/logger'
import { swapFlow } from '@cow/modules/swap/services/swapFlow'
import { ethFlow } from '@cow/modules/swap/services/ethFlow'
import { useConfirmPriceImpactWithoutFee } from '@cow/common/hooks/useConfirmPriceImpactWithoutFee'
import { useSafeBundleFlowContext } from '@cow/modules/swap/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from '@cow/modules/swap/services/safeBundleFlow'

export function useHandleSwap(priceImpactParams: PriceImpact): () => Promise<void> {
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const safeBundleFlowContext = useSafeBundleFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const { onChangeRecipient } = useSwapActionHandlers()

  return useCallback(async () => {
    if (!swapFlowContext && !ethFlowContext && !safeBundleFlowContext) return

    if (safeBundleFlowContext) {
      logTradeFlow('SAFE BUNDLE FLOW', 'Start safe bundle flow')
      await safeBundleFlow(safeBundleFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
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
