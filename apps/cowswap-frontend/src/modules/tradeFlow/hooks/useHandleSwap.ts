import { useCallback, useRef } from 'react'

import { useConfig } from 'wagmi'

import { percentToBps } from '@cowprotocol/common-utils'
import { Percent } from '@cowprotocol/currency'
import { OnTradeParamsPayload } from '@cowprotocol/events'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { Field } from 'legacy/state/types'

import { ethFlow, useEthFlowContext } from 'modules/ethFlow'
import { buildTradeWidgetHookPayload, callWidgetHook } from 'modules/injectedWidget'
import {
  TradeWidgetActions,
  logTradeFlow,
  useDerivedTradeState,
  useSolanaWrapAndDelegateDoTrade,
  useTradeFlowAnalytics,
  useTradePriceImpact,
} from 'modules/trade'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useSafeBundleFlowContext } from './useSafeBundleFlowContext'
import { useSolanaTradeFlowContext } from './useSolanaTradeFlowContext'
import { TradeFlowParams, useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowType } from './useTradeFlowType'

import { safeBundleApprovalFlow, safeBundleEthFlow } from '../services/safeBundleFlow'
import { solanaFlow } from '../services/solanaFlow'
import { swapFlow } from '../services/swapFlow'
import { FlowType, SafeBundleFlowContext, SolanaTradeFlowContext, TradeFlowContext } from '../types/TradeFlowContext'

type ConfirmPriceImpactFn = (priceImpact: Percent | undefined) => Promise<boolean>

export function useHandleSwap(
  params: TradeFlowParams,
  { onUserInput, onChangeRecipient }: TradeWidgetActions,
): { callback(): Promise<false | void>; contextIsReady: boolean } {
  const config = useConfig()
  const { tradeFlowType, tradeFlowContext, safeBundleFlowContext, solanaFlowContext } = useTradeFlow(params)
  const isBridge = getAreBridgeCurrencies(
    tradeFlowContext?.context.inputAmount.currency,
    tradeFlowContext?.context.outputAmount.currency,
  )
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee(isBridge)
  const priceImpactParams = useTradePriceImpact()
  const ethFlowContext = useEthFlowContext()
  const analytics = useTradeFlowAnalytics()
  const derivedTradeState = useDerivedTradeState()

  const contextIsReady =
    tradeFlowType === FlowType.SOLANA_SWAP
      ? !!solanaFlowContext
      : Boolean(
          [FlowType.SAFE_BUNDLE_ETH, FlowType.SAFE_BUNDLE_APPROVAL].includes(tradeFlowType)
            ? safeBundleFlowContext
            : tradeFlowContext,
        ) && !!tradeFlowContext

  const flowInProgressRef = useRef(false)

  const callback = useCallback(async () => {
    if (tradeFlowType === FlowType.SOLANA_SWAP) {
      if (!solanaFlowContext) return
    } else if (!tradeFlowContext) {
      return
    }
    if (flowInProgressRef.current) return
    flowInProgressRef.current = true

    const hookPayload = buildHookPayload(
      tradeFlowType,
      solanaFlowContext,
      tradeFlowContext,
      derivedTradeState?.slippage,
    )

    const isWidgetHookPassed = await callWidgetHook(WidgetHookEvents.ON_BEFORE_TRADE, hookPayload)

    if (!isWidgetHookPassed) {
      flowInProgressRef.current = false
      return
    }

    try {
      const result = await runFlowByType(tradeFlowType, tradeFlowContext, {
        ethFlowContext,
        safeBundleFlowContext,
        solanaFlowContext,
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
    }
  }, [
    config,
    tradeFlowContext,
    solanaFlowContext,
    tradeFlowType,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
    analytics,
    ethFlowContext,
    safeBundleFlowContext,
    onChangeRecipient,
    onUserInput,
    derivedTradeState?.slippage,
  ])

  const solanaWrapAndDelegateDoTrade = useSolanaWrapAndDelegateDoTrade()

  if (solanaWrapAndDelegateDoTrade) {
    return solanaWrapAndDelegateDoTrade
  }

  return { callback, contextIsReady }
}

function buildHookPayload(
  tradeFlowType: FlowType,
  solanaFlowContext: SolanaTradeFlowContext | null,
  tradeFlowContext: TradeFlowContext | null,
  slippage: Percent | null | undefined,
): OnTradeParamsPayload {
  if (tradeFlowType === FlowType.SOLANA_SWAP && solanaFlowContext) {
    return buildTradeWidgetHookPayload({
      orderType: solanaFlowContext.swapFlowAnalyticsContext.orderType,
      inputAmount: solanaFlowContext.context.inputAmount,
      outputAmount: solanaFlowContext.context.outputAmount,
      recipient: solanaFlowContext.swapFlowAnalyticsContext.recipient,
      orderKind: solanaFlowContext.context.orderKind,
      chainId: solanaFlowContext.context.chainId,
      validTo: solanaFlowContext.context.validTo,
      slippageBps: slippage ? percentToBps(slippage) : undefined,
    })
  }

  // tradeFlowContext is guaranteed non-null here by the caller's earlier guard.
  return buildTradeWidgetHookPayload({
    orderType: tradeFlowContext!.swapFlowAnalyticsContext.orderType,
    inputAmount: tradeFlowContext!.context.inputAmount,
    outputAmount: tradeFlowContext!.context.outputAmount,
    recipient: tradeFlowContext!.swapFlowAnalyticsContext.recipient,
    orderKind: tradeFlowContext!.orderParams.kind,
    chainId: tradeFlowContext!.orderParams.chainId,
    validTo: tradeFlowContext!.orderParams.validTo,
    slippageBps: slippage ? percentToBps(slippage) : undefined,
  })
}

async function runFlowByType(
  tradeFlowType: FlowType,
  tradeFlowContext: TradeFlowContext | null,
  deps: {
    ethFlowContext: ReturnType<typeof useEthFlowContext>
    safeBundleFlowContext: SafeBundleFlowContext | null
    solanaFlowContext: SolanaTradeFlowContext | null
    priceImpactParams: ReturnType<typeof useTradePriceImpact>
    confirmPriceImpactWithoutFee: ConfirmPriceImpactFn
    analytics: ReturnType<typeof useTradeFlowAnalytics>
    config: ReturnType<typeof useConfig>
  },
): Promise<boolean> {
  if (tradeFlowType === FlowType.SOLANA_SWAP) {
    if (!deps.solanaFlowContext) throw new Error('Solana flow context is not ready')
    logTradeFlow('SOLANA FLOW', 'Start solana flow')
    const result = await solanaFlow(deps.solanaFlowContext, deps.analytics)
    return result === true
  }
  if (!tradeFlowContext) throw new Error('Trade flow context is not ready')
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
  solanaFlowContext: SolanaTradeFlowContext | null
} {
  const tradeFlowType = useTradeFlowType()
  const tradeFlowContext = useTradeFlowContext(params)
  const safeBundleFlowContext = useSafeBundleFlowContext()
  const solanaFlowContext = useSolanaTradeFlowContext(params)

  return { tradeFlowType, tradeFlowContext, safeBundleFlowContext, solanaFlowContext }
}
