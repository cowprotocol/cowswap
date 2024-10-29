import { useCallback } from 'react'

import { Field } from 'legacy/state/types'

import { TradeWidgetActions, useTradePriceImpact } from 'modules/trade'
import { logTradeFlow } from 'modules/trade/utils/logger'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useSafeBundleFlowContext } from './useSafeBundleFlowContext'
import { TradeFlowParams, useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowType } from './useTradeFlowType'

import { safeBundleApprovalFlow, safeBundleEthFlow } from '../services/safeBundleFlow'
import { swapFlow } from '../services/swapFlow'
import { FlowType } from '../types/TradeFlowContext'

export function useHandleSwap(params: TradeFlowParams, actions: TradeWidgetActions) {
  const tradeFlowType = useTradeFlowType()
  const tradeFlowContext = useTradeFlowContext(params)
  const safeBundleFlowContext = useSafeBundleFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const priceImpactParams = useTradePriceImpact()
  const { onUserInput, onChangeRecipient } = actions

  const contextIsReady =
    Boolean(
      [FlowType.SAFE_BUNDLE_ETH, FlowType.SAFE_BUNDLE_APPROVAL].includes(tradeFlowType)
        ? safeBundleFlowContext
        : tradeFlowContext,
    ) && !!tradeFlowContext

  const callback = useCallback(async () => {
    if (!tradeFlowContext) return

    const result = await (() => {
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
        return safeBundleEthFlow(
          tradeFlowContext,
          safeBundleFlowContext,
          priceImpactParams,
          confirmPriceImpactWithoutFee,
        )
      }

      logTradeFlow('SWAP FLOW', 'Start swap flow')
      return swapFlow(tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    })()

    // Clean up form fields after successful swap
    if (result === true) {
      onChangeRecipient(null)
      onUserInput(Field.INPUT, '')
    }
  }, [
    tradeFlowType,
    tradeFlowContext,
    safeBundleFlowContext,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
    onChangeRecipient,
    onUserInput,
  ])

  return { callback, contextIsReady }
}
