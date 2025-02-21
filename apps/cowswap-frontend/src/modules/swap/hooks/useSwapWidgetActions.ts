import { useCallback, useMemo } from 'react'

import { isSellOrder, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { TradeWidgetActions, useOnCurrencySelection, useSwitchTokensPlaces } from 'modules/trade'

import { useSwapDerivedState } from './useSwapDerivedState'
import { useUpdateCurrencyAmount } from './useUpdateCurrencyAmount'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

export function useSwapWidgetActions(): TradeWidgetActions {
  const { inputCurrency, outputCurrency, orderKind } = useSwapDerivedState()
  const updateSwapState = useUpdateSwapRawState()
  const onCurrencySelection = useOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency)

      updateCurrencyAmount(field, value)
    },
    [updateCurrencyAmount, inputCurrency, outputCurrency],
  )

  const onSwitchTokens = useSwitchTokensPlaces({
    orderKind: isSellOrder(orderKind) ? OrderKind.BUY : OrderKind.SELL,
  })

  const onChangeRecipient = useCallback((recipient: string | null) => updateSwapState({ recipient }), [updateSwapState])

  return useMemo(
    () => ({ onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection }),
    [onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection],
  )
}
