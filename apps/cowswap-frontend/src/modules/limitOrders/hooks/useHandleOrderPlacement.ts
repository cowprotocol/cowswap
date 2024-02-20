import { useAtom, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { getAddress } from '@cowprotocol/common-utils'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { updateLimitOrdersRawStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

import OperatorError from 'api/gnosisProtocol/errors/OperatorError'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { TradeAmounts } from 'common/types'

export function useHandleOrderPlacement(
  tradeContext: TradeFlowContext | null,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions
): () => Promise<void> {
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const updateLimitOrdersState = useSetAtom(updateLimitOrdersRawStateAtom)
  const [partiallyFillableOverride, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)
  // tx bundling stuff
  const safeBundleFlowContext = useSafeBundleFlowContext(tradeContext)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)

  const beforePermit = useCallback(async () => {
    if (!tradeContext) return

    const {
      postOrderParams: { inputAmount },
      getCachedPermit,
    } = tradeContext
    const inputCurrency = inputAmount.currency

    const cachedPermit = await getCachedPermit(getAddress(inputCurrency))

    if (cachedPermit) return

    tradeConfirmActions.requestPermitSignature(buildTradeAmounts(tradeContext))
  }, [tradeConfirmActions, tradeContext])

  const beforeTrade = useCallback(() => {
    if (!tradeContext) return

    tradeConfirmActions.onSign(buildTradeAmounts(tradeContext))
  }, [tradeContext, tradeConfirmActions])

  const tradeFn = useCallback(async () => {
    if (isSafeBundle) {
      if (!safeBundleFlowContext) throw new Error('safeBundleFlowContext is not set!')

      safeBundleFlowContext.postOrderParams.partiallyFillable =
        partiallyFillableOverride ?? safeBundleFlowContext.postOrderParams.partiallyFillable

      return safeBundleFlow(
        safeBundleFlowContext,
        priceImpact,
        settingsState,
        confirmPriceImpactWithoutFee,
        beforeTrade
      )
    }

    if (!tradeContext) throw new Error('tradeContext is not set!')

    tradeContext.postOrderParams.partiallyFillable =
      partiallyFillableOverride ?? tradeContext.postOrderParams.partiallyFillable

    return tradeFlow(tradeContext, priceImpact, settingsState, confirmPriceImpactWithoutFee, beforePermit, beforeTrade)
  }, [
    beforePermit,
    beforeTrade,
    confirmPriceImpactWithoutFee,
    isSafeBundle,
    partiallyFillableOverride,
    priceImpact,
    safeBundleFlowContext,
    settingsState,
    tradeContext,
  ])

  return useCallback(() => {
    return tradeFn()
      .then((orderHash) => {
        tradeConfirmActions.onSuccess(orderHash)

        updateLimitOrdersState({ recipient: null })
        // Reset override after successful order placement
        setPartiallyFillableOverride(undefined)
      })
      .catch((error) => {
        if (error instanceof PriceImpactDeclineError) return

        if (error instanceof OperatorError) {
          tradeConfirmActions.onError(error.message)
        } else {
          tradeConfirmActions.onError(getSwapErrorMessage(error))
        }
      })
  }, [tradeFn, tradeConfirmActions, updateLimitOrdersState, setPartiallyFillableOverride])
}

function buildTradeAmounts(tradeContext: TradeFlowContext): TradeAmounts {
  return {
    inputAmount: tradeContext.postOrderParams.inputAmount,
    outputAmount: tradeContext.postOrderParams.outputAmount,
  }
}
