import { useCallback } from 'react'

import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { buildTradeWidgetHookPayload, BuildTradeWidgetHookPayloadParams, callWidgetHook } from 'modules/injectedWidget'
import { TradeConfirmActions, useTradeFlowAnalytics } from 'modules/trade'
import { solanaFlow, SolanaTradeFlowContext } from 'modules/tradeFlow'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { useSafeBundleFlowContext } from './useSafeBundleFlowContext'
import { useSolanaTradeFlowContext } from './useSolanaTradeFlowContext'
import { useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowParams } from './useTradeFlowParams'

import { safeBundleFlow } from '../services/safeBundleFlow'
import { tradeFlow } from '../services/tradeFlow'
import { TradeFlowContext } from '../services/types'
import { LimitOrdersSettingsState } from '../state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from '../utils/calculateLimitOrdersDeadline'

export function useLimitOrdersTradeCallback(
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions,
): () => Promise<string | boolean | undefined> {
  const { chainId } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)
  const tradeFlowParams = useTradeFlowParams(priceImpact, settingsState, tradeConfirmActions)
  const tradeContext = useTradeFlowContext()
  const solanaContext = useSolanaTradeFlowContext()
  const safeBundleFlowContext = useSafeBundleFlowContext(tradeContext)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)
  const canUsePermit = Boolean(tradeContext?.allowsOffchainSigning && isSupportedPermitInfo(tradeContext.permitInfo))
  // Temporary: keep limit-order bundles Safe-only until EIP-5792 order lifecycle tracking lands.
  // Solana has no Safe-wallet/bundling concept — same precedence swap's own dispatcher gives it.
  const shouldUseSafeBundle =
    !isSolana && isSafeBundle && Boolean(tradeContext?.postOrderParams.isSafeWallet) && !canUsePermit
  const analytics = useTradeFlowAnalytics()

  return useCallback(async (): Promise<string | true | undefined> => {
    const widgetHookPayloadParams = getTradeWidgetHookPayloadParams(solanaContext, tradeContext, settingsState)

    if (!widgetHookPayloadParams) return undefined

    const isWidgetHookPassed = await callWidgetHook(
      WidgetHookEvents.ON_BEFORE_TRADE,
      buildTradeWidgetHookPayload(widgetHookPayloadParams),
    )

    if (!isWidgetHookPassed) return undefined

    // Solana flow
    if (isSolana && solanaContext) {
      const placed = await solanaFlow(solanaContext, analytics)
      return placed === true ? true : undefined
    }

    // Safe bundle flow
    if (shouldUseSafeBundle && safeBundleFlowContext) {
      return safeBundleFlow(safeBundleFlowContext, tradeFlowParams)
    }

    // Regular limit order flow
    if (tradeContext) {
      return tradeFlow(tradeContext, tradeFlowParams)
    }

    return undefined
  }, [
    settingsState,
    tradeFlowParams,
    isSolana,
    solanaContext,
    analytics,
    shouldUseSafeBundle,
    tradeContext,
    safeBundleFlowContext,
  ])
}

function getTradeWidgetHookPayloadParams(
  solanaContext: SolanaTradeFlowContext | null,
  tradeContext: TradeFlowContext | null,
  settingsState: LimitOrdersSettingsState,
): BuildTradeWidgetHookPayloadParams | undefined {
  if (solanaContext) {
    return {
      orderType: UiOrderType.LIMIT,
      inputAmount: solanaContext.context.inputAmount,
      outputAmount: solanaContext.context.outputAmount,
      recipient: solanaContext.context.receiver,
      orderKind: solanaContext.context.orderKind,
      chainId: solanaContext.context.chainId,
      validTo: solanaContext.context.validTo,
    }
  }

  if (tradeContext) {
    return {
      orderType: UiOrderType.LIMIT,
      inputAmount: tradeContext.postOrderParams.inputAmount,
      outputAmount: tradeContext.postOrderParams.outputAmount,
      recipient: tradeContext.postOrderParams.recipient,
      orderKind: tradeContext.postOrderParams.kind,
      chainId: tradeContext.chainId,
      validTo: tradeContext.quoteState
        ? calculateLimitOrdersDeadline(settingsState, tradeContext.quoteState)
        : undefined,
    }
  }

  return undefined
}
