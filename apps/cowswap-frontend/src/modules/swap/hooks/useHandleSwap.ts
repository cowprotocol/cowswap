import { useCallback } from 'react'

import { Field } from 'legacy/state/types'

import { ethFlow } from 'modules/swap/services/ethFlow'
import { safeBundleApprovalFlow, safeBundleEthFlow } from 'modules/swap/services/safeBundleFlow'
import { swapFlow } from 'modules/swap/services/swapFlow'
import { FlowType, useSafeBundleFlowContext, useTradeFlowType, useTradePriceImpact } from 'modules/trade'
import { logTradeFlow } from 'modules/trade/utils/logger'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useEthFlowContext } from './useEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'
import { useSwapActionHandlers } from './useSwapState'

export function useHandleSwap() {
  const tradeFlowType = useTradeFlowType()
  const swapFlowContext = useSwapFlowContext()
  const safeBundleFlowContext = useSafeBundleFlowContext()
  const ethFlowContext = useEthFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const { onChangeRecipient, onUserInput } = useSwapActionHandlers()
  const priceImpactParams = useTradePriceImpact()

  const contextIsReady =
    Boolean(
      tradeFlowType === FlowType.EOA_ETH_FLOW
        ? ethFlowContext
        : [FlowType.SAFE_BUNDLE_ETH, FlowType.SAFE_BUNDLE_APPROVAL].includes(tradeFlowType)
          ? safeBundleFlowContext
          : swapFlowContext,
    ) && !!swapFlowContext

  const callback = useCallback(async () => {
    const tradeResult = await (async () => {
      if (!swapFlowContext) return

      if (tradeFlowType === FlowType.SAFE_BUNDLE_APPROVAL) {
        if (!safeBundleFlowContext) throw new Error('Safe bundle flow context is not ready')

        logTradeFlow('SAFE BUNDLE APPROVAL FLOW', 'Start safe bundle approval flow')
        return safeBundleApprovalFlow(
          swapFlowContext,
          safeBundleFlowContext,
          priceImpactParams,
          confirmPriceImpactWithoutFee,
        )
      }
      if (tradeFlowType === FlowType.SAFE_BUNDLE_ETH) {
        if (!safeBundleFlowContext) throw new Error('Safe bundle flow context is not ready')

        logTradeFlow('SAFE BUNDLE ETH FLOW', 'Start safe bundle eth flow')
        return safeBundleEthFlow(
          swapFlowContext,
          safeBundleFlowContext,
          priceImpactParams,
          confirmPriceImpactWithoutFee,
        )
      }
      if (tradeFlowType === FlowType.EOA_ETH_FLOW) {
        if (!ethFlowContext) throw new Error('Eth flow context is not ready')

        logTradeFlow('ETH FLOW', 'Start eth flow')
        return ethFlow(swapFlowContext, ethFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
      }

      logTradeFlow('SWAP FLOW', 'Start swap flow')
      return swapFlow(swapFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    })()

    const isPriceImpactDeclined = tradeResult === false

    // Clean up form fields after successful swap
    if (!isPriceImpactDeclined) {
      onChangeRecipient(null)
      onUserInput(Field.INPUT, '')
    }
  }, [
    swapFlowContext,
    safeBundleFlowContext,
    ethFlowContext,
    onChangeRecipient,
    onUserInput,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
  ])

  return { callback, contextIsReady }
}
