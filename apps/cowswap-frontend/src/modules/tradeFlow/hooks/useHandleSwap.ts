import { useCallback } from 'react'

import { useTradePriceImpact } from 'modules/trade'
import { logTradeFlow } from 'modules/trade/utils/logger'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useSafeBundleFlowContext } from './useSafeBundleFlowContext'
import { TradeFlowParams, useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowType } from './useTradeFlowType'

import { safeBundleApprovalFlow, safeBundleEthFlow } from '../services/safeBundleFlow'
import { swapFlow } from '../services/swapFlow'
import { FlowType } from '../types/TradeFlowContext'

export function useHandleSwap(params: TradeFlowParams) {
  const tradeFlowType = useTradeFlowType()
  const tradeFlowContext = useTradeFlowContext(params)
  const safeBundleFlowContext = useSafeBundleFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const priceImpactParams = useTradePriceImpact()

  const contextIsReady =
    Boolean(
      [FlowType.SAFE_BUNDLE_ETH, FlowType.SAFE_BUNDLE_APPROVAL].includes(tradeFlowType)
        ? safeBundleFlowContext
        : tradeFlowContext,
    ) && !!tradeFlowContext

  const callback = useCallback(async () => {
    if (!tradeFlowContext) return

    if (tradeFlowType === FlowType.SAFE_BUNDLE_APPROVAL) {
      if (!safeBundleFlowContext) throw new Error('Safe bundle flow context is not ready')

      logTradeFlow('SAFE BUNDLE APPROVAL FLOW', 'Start safe bundle approval flow')
      return safeBundleApprovalFlow(
        tradeFlowContext,
        safeBundleFlowContext,
        priceImpactParams,
        confirmPriceImpactWithoutFee,
      )
    }
    if (tradeFlowType === FlowType.SAFE_BUNDLE_ETH) {
      if (!safeBundleFlowContext) throw new Error('Safe bundle flow context is not ready')

      logTradeFlow('SAFE BUNDLE ETH FLOW', 'Start safe bundle eth flow')
      return safeBundleEthFlow(tradeFlowContext, safeBundleFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    }

    logTradeFlow('SWAP FLOW', 'Start swap flow')
    return swapFlow(tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
  }, [tradeFlowType, tradeFlowContext, safeBundleFlowContext, priceImpactParams, confirmPriceImpactWithoutFee])

  return { callback, contextIsReady }
}
