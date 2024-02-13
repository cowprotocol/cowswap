import { useCallback } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { useSafeBundleApprovalFlowContext } from 'modules/swap/hooks/useSafeBundleApprovalFlowContext'
import { ethFlow } from 'modules/swap/services/ethFlow'
import { safeBundleApprovalFlow, safeBundleEthFlow } from 'modules/swap/services/safeBundleFlow'
import { swapFlow } from 'modules/swap/services/swapFlow'
import { logTradeFlow } from 'modules/trade/utils/logger'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useEthFlowContext } from './useEthFlowContext'
import { useSafeBundleEthFlowContext } from './useSafeBundleEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'
import { useSwapActionHandlers } from './useSwapState'

export function useHandleSwap(priceImpactParams: PriceImpact): () => Promise<void> {
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const safeBundleApprovalFlowContext = useSafeBundleApprovalFlowContext()
  const safeBundleEthFlowContext = useSafeBundleEthFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const { onChangeRecipient, onUserInput } = useSwapActionHandlers()

  return useCallback(async () => {
    if (!swapFlowContext && !ethFlowContext && !safeBundleApprovalFlowContext && !safeBundleEthFlowContext) return

    const tradeResult = await (async () => {
      if (safeBundleApprovalFlowContext) {
        logTradeFlow('SAFE BUNDLE APPROVAL FLOW', 'Start safe bundle approval flow')
        return safeBundleApprovalFlow(safeBundleApprovalFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
      } else if (safeBundleEthFlowContext) {
        logTradeFlow('SAFE BUNDLE ETH FLOW', 'Start safe bundle eth flow')
        return safeBundleEthFlow(safeBundleEthFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
      } else if (swapFlowContext) {
        logTradeFlow('SWAP FLOW', 'Start swap flow')
        return swapFlow(swapFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
      } else if (ethFlowContext) {
        logTradeFlow('ETH FLOW', 'Start eth flow')
        return ethFlow(ethFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
      }
    })()

    const isPriceImpactDeclined = tradeResult === false

    // Clean up form fields after successful swap
    if (!isPriceImpactDeclined) {
      onChangeRecipient(null)
      onUserInput(Field.INPUT, '')
    }
  }, [
    swapFlowContext,
    ethFlowContext,
    safeBundleApprovalFlowContext,
    safeBundleEthFlowContext,
    onChangeRecipient,
    onUserInput,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
  ])
}
