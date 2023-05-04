import { useCallback } from 'react'
import { Field } from '@src/state/swap/actions'
import tryParseCurrencyAmount from '@src/lib/utils/tryParseCurrencyAmount'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { TradeWidgetActions } from '@cow/modules/trade/containers/TradeWidget'
import { useLimitOrdersDerivedState } from '@cow/modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { limitOrdersRawStateAtom, updateLimitOrdersRawStateAtom } from '@cow/modules/limitOrders'
import { useWalletInfo } from '@cow/modules/wallet'
import { useOnCurrencySelection } from '@cow/modules/trade/hooks/useOnCurrencySelection'
import { useIsWrapOrUnwrap } from '@cow/modules/trade/hooks/useIsWrapOrUnwrap'

export function useLimitOrdersWidgetActions(): TradeWidgetActions {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, orderKind } =
    useLimitOrdersDerivedState()
  const { activeRate } = useAtomValue(limitRateAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const limitOrdersNavigate = useTradeNavigate()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const state = useAtomValue(limitOrdersRawStateAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)

  const onCurrencySelection = useOnCurrencySelection()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      updateCurrencyAmount({
        activeRate,
        amount: value,
        orderKind: isWrapOrUnwrap || field === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
      })
    },
    [updateCurrencyAmount, isWrapOrUnwrap, inputCurrency, outputCurrency, activeRate]
  )

  const onSwitchTokens = useCallback(() => {
    const { inputCurrencyId, outputCurrencyId } = state

    if (!isWrapOrUnwrap) {
      updateLimitOrdersState({
        inputCurrencyId: outputCurrencyId,
        outputCurrencyId: inputCurrencyId,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
        outputCurrencyAmount: FractionUtils.serializeFractionToJSON(inputCurrencyAmount),
        orderKind: orderKind === OrderKind.SELL ? OrderKind.BUY : OrderKind.SELL,
      })
    }
    limitOrdersNavigate(chainId, { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId })
  }, [
    state,
    isWrapOrUnwrap,
    limitOrdersNavigate,
    updateLimitOrdersState,
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    orderKind,
  ])

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

  return { onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection }
}
