import { useCallback, useRef } from 'react'

import { Percent } from '@cowprotocol/currency'

import { useConfig } from 'wagmi'

import { Field } from 'legacy/state/types'

import { ethFlow, useEthFlowContext } from 'modules/ethFlow'
import { TradeWidgetActions, logTradeFlow, useTradeFlowAnalytics, useTradePriceImpact } from 'modules/trade'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useSafeBundleFlowContext } from './useSafeBundleFlowContext'
import { TradeFlowParams, useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowType } from './useTradeFlowType'

import { safeBundleApprovalFlow, safeBundleEthFlow } from '../services/safeBundleFlow'
import { swapFlow } from '../services/swapFlow'
import { acquireSwapFlowLock, releaseSwapFlowLock } from '../state/swapFlowLock'
import { FlowType, SafeBundleFlowContext, TradeFlowContext } from '../types/TradeFlowContext'

type ConfirmPriceImpactFn = (priceImpact: Percent | undefined) => Promise<boolean>

async function runFlowByType(
  tradeFlowType: FlowType,
  tradeFlowContext: TradeFlowContext,
  deps: {
    ethFlowContext: ReturnType<typeof useEthFlowContext>
    safeBundleFlowContext: SafeBundleFlowContext | null
    priceImpactParams: ReturnType<typeof useTradePriceImpact>
    confirmPriceImpactWithoutFee: ConfirmPriceImpactFn
    analytics: ReturnType<typeof useTradeFlowAnalytics>
    config: ReturnType<typeof useConfig>
  },
): Promise<boolean> {
  if (tradeFlowType === FlowType.EOA_ETH_FLOW) {
    if (!deps.ethFlowContext) throw new Error('Eth flow context is not ready')
    logTradeFlow('ETH FLOW', 'Start eth flow')
    const result = await ethFlow({
      tradeContext: tradeFlowContext,
      ethFlowContext: deps.ethFlowContext,
      priceImpactParams: deps.priceImpactParams,
      confirmPriceImpactWithoutFee: deps.confirmPriceImpactWithoutFee,
      analytics: deps.analytics,
    })
    return result === true
  }
  if (tradeFlowType === FlowType.SAFE_BUNDLE_APPROVAL) {
    if (!deps.safeBundleFlowContext) throw new Error('Safe bundle flow context is not ready')
    logTradeFlow('SAFE BUNDLE APPROVAL FLOW', 'Start safe bundle approval flow')
    const result = await safeBundleApprovalFlow({
      tradeContext: tradeFlowContext,
      safeBundleContext: deps.safeBundleFlowContext,
      priceImpactParams: deps.priceImpactParams,
      confirmPriceImpactWithoutFee: deps.confirmPriceImpactWithoutFee,
      analytics: deps.analytics,
      config: deps.config,
    })
    return result === true
  }
  if (tradeFlowType === FlowType.SAFE_BUNDLE_ETH) {
    if (!deps.safeBundleFlowContext) throw new Error('Safe bundle flow context is not ready')
    logTradeFlow('SAFE BUNDLE ETH FLOW', 'Start safe bundle eth flow')
    const result = await safeBundleEthFlow(
      tradeFlowContext,
      deps.safeBundleFlowContext,
      deps.priceImpactParams,
      deps.confirmPriceImpactWithoutFee,
      deps.analytics,
    )
    return result === true
  }
  logTradeFlow('SWAP FLOW', 'Start swap flow')
  const result = await swapFlow(
    tradeFlowContext,
    deps.priceImpactParams,
    deps.confirmPriceImpactWithoutFee,
    deps.analytics,
  )
  return result === true
}

function useTradeFlow(params: TradeFlowParams): {
  tradeFlowType: FlowType
  tradeFlowContext: TradeFlowContext | null
  safeBundleFlowContext: SafeBundleFlowContext | null
} {
  const tradeFlowType = useTradeFlowType()
  const tradeFlowContext = useTradeFlowContext(params)
  const safeBundleFlowContext = useSafeBundleFlowContext()

  return { tradeFlowType, tradeFlowContext, safeBundleFlowContext }
}

export function useHandleSwap(
  params: TradeFlowParams,
  { onUserInput, onChangeRecipient }: TradeWidgetActions,
): { callback(): Promise<false | void>; contextIsReady: boolean } {
  const config = useConfig()
  const { tradeFlowType, tradeFlowContext, safeBundleFlowContext } = useTradeFlow(params)
  const isBridge = getAreBridgeCurrencies(
    tradeFlowContext?.context.inputAmount.currency,
    tradeFlowContext?.context.outputAmount.currency,
  )
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee(isBridge)
  const priceImpactParams = useTradePriceImpact()
  const ethFlowContext = useEthFlowContext()
  const analytics = useTradeFlowAnalytics()

  const contextIsReady =
    Boolean(
      [FlowType.SAFE_BUNDLE_ETH, FlowType.SAFE_BUNDLE_APPROVAL].includes(tradeFlowType)
        ? safeBundleFlowContext
        : tradeFlowContext,
    ) && !!tradeFlowContext

  const flowInProgressRef = useRef(false)

  const callback = useCallback(async () => {
    if (!tradeFlowContext) return
    if (flowInProgressRef.current) return
    if (!acquireSwapFlowLock()) return
    flowInProgressRef.current = true

    try {
      const result = await runFlowByType(tradeFlowType, tradeFlowContext, {
        ethFlowContext,
        safeBundleFlowContext,
        priceImpactParams,
        confirmPriceImpactWithoutFee,
        analytics,
        config,
      })

      if (result === true) {
        onChangeRecipient(null)
        onUserInput(Field.INPUT, '')
      }
    } finally {
      flowInProgressRef.current = false
      releaseSwapFlowLock()
    }
  }, [
    config,
    tradeFlowContext,
    tradeFlowType,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
    analytics,
    ethFlowContext,
    safeBundleFlowContext,
    onChangeRecipient,
    onUserInput,
  ])

  return { callback, contextIsReady }
}
