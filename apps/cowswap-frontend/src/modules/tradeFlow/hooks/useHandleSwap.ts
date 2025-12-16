import { useCallback } from 'react'

import { useLingui } from '@lingui/react/macro'

import { Field } from 'legacy/state/types'

import { ethFlow, useEthFlowContext } from 'modules/ethFlow'
import { TradeWidgetActions, useTradePriceImpact } from 'modules/trade'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { useTradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useSafeBundleFlowContext } from './useSafeBundleFlowContext'
import { TradeFlowParams, useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowType } from './useTradeFlowType'

import { safeBundleApprovalFlow, safeBundleEthFlow } from '../services/safeBundleFlow'
import { swapFlow } from '../services/swapFlow'
import { FlowType } from '../types/TradeFlowContext'

export function useHandleSwap(
  params: TradeFlowParams,
  actions: TradeWidgetActions,
): { callback(): Promise<false | void>; contextIsReady: boolean } {
  const tradeFlowType = useTradeFlowType()
  const tradeFlowContext = useTradeFlowContext(params)
  const safeBundleFlowContext = useSafeBundleFlowContext()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const priceImpactParams = useTradePriceImpact()
  const ethFlowContext = useEthFlowContext()
  const { onUserInput, onChangeRecipient } = actions
  const analytics = useTradeFlowAnalytics()
  const { t } = useLingui()

  const contextIsReady =
    Boolean(
      [FlowType.SAFE_BUNDLE_ETH, FlowType.SAFE_BUNDLE_APPROVAL].includes(tradeFlowType)
        ? safeBundleFlowContext
        : tradeFlowContext,
    ) && !!tradeFlowContext

  const callback = useCallback(async () => {
    if (!tradeFlowContext) return

    const result = await (() => {
      if (tradeFlowType === FlowType.EOA_ETH_FLOW) {
        if (!ethFlowContext) throw new Error(t`Eth flow context is not ready`)

        logTradeFlow('ETH FLOW', 'Start eth flow')
        return ethFlow({
          tradeContext: tradeFlowContext,
          ethFlowContext,
          priceImpactParams,
          confirmPriceImpactWithoutFee,
          analytics,
        })
      }

      if (tradeFlowType === FlowType.SAFE_BUNDLE_APPROVAL) {
        if (!safeBundleFlowContext) throw new Error(t`Safe bundle flow context is not ready`)

        logTradeFlow('SAFE BUNDLE APPROVAL FLOW', 'Start safe bundle approval flow')
        return safeBundleApprovalFlow(
          tradeFlowContext,
          safeBundleFlowContext,
          priceImpactParams,
          confirmPriceImpactWithoutFee,
          analytics,
        )
      }
      if (tradeFlowType === FlowType.SAFE_BUNDLE_ETH) {
        if (!safeBundleFlowContext) throw new Error(t`Safe bundle flow context is not ready`)

        logTradeFlow('SAFE BUNDLE ETH FLOW', 'Start safe bundle eth flow')
        return safeBundleEthFlow(
          tradeFlowContext,
          safeBundleFlowContext,
          priceImpactParams,
          confirmPriceImpactWithoutFee,
          analytics,
        )
      }

      logTradeFlow('SWAP FLOW', 'Start swap flow')
      return swapFlow(tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee, analytics)
    })()

    // Clean up form fields after successful swap
    if (result === true) {
      onChangeRecipient(null)
      onUserInput(Field.INPUT, '')
    }
  }, [
    tradeFlowContext,
    tradeFlowType,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
    analytics,
    ethFlowContext,
    t,
    safeBundleFlowContext,
    onChangeRecipient,
    onUserInput,
  ])

  return { callback, contextIsReady }
}
