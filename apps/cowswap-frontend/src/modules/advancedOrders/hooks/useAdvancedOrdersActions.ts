import { useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useNavigateOnCurrencySelection, useSwitchTokensPlaces, useUpdateCurrencyAmount } from 'modules/trade'
import { createDebouncedTradeAmountAnalytics } from 'modules/trade/utils/analytics'
import { useResetTradeQuote } from 'modules/tradeQuote'

import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'
import { useUpdateAdvancedOrdersRawState } from './useAdvancedOrdersRawState'

const onSwitchTradeOverride = {
  outputCurrencyAmount: null,
}

export function useAdvancedOrdersActions() {
  const { inputCurrency } = useAdvancedOrdersDerivedState()

  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const resetTradeQuote = useResetTradeQuote()
  const cowAnalytics = useCowAnalytics()
  const debouncedTradeAmountAnalytics = useMemo(() => createDebouncedTradeAmountAnalytics(cowAnalytics), [cowAnalytics])

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
    [naviageOnCurrencySelection, updateCurrencyAmount, resetTradeQuote],
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      debouncedTradeAmountAnalytics([field, Number(typedValue)])
      updateCurrencyAmount({
        amount: { isTyped: true, value: typedValue },
        currency: inputCurrency,
        field,
      })
    },
    [inputCurrency, updateCurrencyAmount, debouncedTradeAmountAnalytics],
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateAdvancedOrdersState({ recipient })
    },
    [updateAdvancedOrdersState],
  )

  const onSwitchTokensDefault = useSwitchTokensPlaces(onSwitchTradeOverride)

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
    [onCurrencySelection, onUserInput, onChangeRecipient, onSwitchTokens],
  )
}
