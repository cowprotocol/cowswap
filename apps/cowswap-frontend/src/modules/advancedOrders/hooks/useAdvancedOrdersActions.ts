import { useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useNavigateOnCurrencySelection, useSwitchTokensPlaces, useUpdateCurrencyAmount } from 'modules/trade'
import { createDebouncedTradeAmountAnalytics } from 'modules/trade/utils/analytics'

import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'
import { useUpdateAdvancedOrdersRawState } from './useAdvancedOrdersRawState'

const onSwitchTradeOverride = {
  outputCurrencyAmount: null,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAdvancedOrdersActions() {
  const { inputCurrency } = useAdvancedOrdersDerivedState()

  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const cowAnalytics = useCowAnalytics()
  const debouncedTradeAmountAnalytics = useMemo(() => createDebouncedTradeAmountAnalytics(cowAnalytics), [cowAnalytics])

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency | null) => {
      naviageOnCurrencySelection(field, currency)
    },
    [naviageOnCurrencySelection],
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

  const onSwitchTokens = useSwitchTokensPlaces(onSwitchTradeOverride)

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
