import { useCallback, useMemo } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { changeSwapAmountAnalytics } from 'modules/analytics'
import { useNavigateOnCurrencySelection, useSwitchTokensPlaces, useUpdateCurrencyAmount } from 'modules/trade'
import { useResetTradeQuote } from 'modules/tradeQuote'

import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'
import { useUpdateAdvancedOrdersRawState } from './useAdvancedOrdersRawState'

// TODO: this should be also unified for each trade widget (swap, limit, advanced)
export function useAdvancedOrdersActions() {
  const { inputCurrency } = useAdvancedOrdersDerivedState()

  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const resetTradeQuote = useResetTradeQuote()

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency | null) => {
      // Reset the output field until we fetch quote for new selected token
      // This is to avoid displaying wrong amounts in output field
      updateCurrencyAmount({
        amount: { isTyped: false, value: '' },
        field: Field.OUTPUT,
        currency,
      })
      naviageOnCurrencySelection(field, currency)
      resetTradeQuote()
    },
    [naviageOnCurrencySelection, updateCurrencyAmount, resetTradeQuote]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      changeSwapAmountAnalytics(field, Number(typedValue))
      updateCurrencyAmount({
        amount: { isTyped: true, value: typedValue },
        currency: inputCurrency,
        field,
      })
    },
    [inputCurrency, updateCurrencyAmount]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateAdvancedOrdersState({ recipient })
    },
    [updateAdvancedOrdersState]
  )

  const onSwitchTokensDefault = useSwitchTokensPlaces({
    outputCurrencyAmount: null,
  })

  const onSwitchTokens = useCallback(() => {
    onSwitchTokensDefault()
    resetTradeQuote()
  }, [resetTradeQuote, onSwitchTokensDefault])

  return useMemo(
    () => ({
      onCurrencySelection,
      onUserInput,
      onChangeRecipient,
      onSwitchTokens,
    }),
    [onCurrencySelection, onUserInput, onChangeRecipient, onSwitchTokens]
  )
}
