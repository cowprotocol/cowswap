import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { changeSwapAmountAnalytics } from 'legacy/components/analytics'
import { Field } from 'legacy/state/swap/actions'

import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useSwitchTokensPlaces } from 'modules/trade/hooks/useSwitchTokensPlaces'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { updateTradeQuoteAtom } from 'modules/tradeQuote'

import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'
import { useUpdateAdvancedOrdersRawState } from './useAdvancedOrdersRawState'

// TODO: this should be also unified for each trade widget (swap, limit, advanced)
export function useAdvancedOrdersActions() {
  const { inputCurrency } = useAdvancedOrdersDerivedState()

  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const updateQuoteState = useSetAtom(updateTradeQuoteAtom)

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency | null) => {
      // Reset the output field until we fetch quote for new selected token
      // This is to avoid displaying wrong amounts in output field
      updateCurrencyAmount({
        amount: { isTyped: true, value: '' },
        field: Field.OUTPUT,
        currency,
      })
      naviageOnCurrencySelection(field, currency)
      updateQuoteState({ response: null })
    },
    [naviageOnCurrencySelection, updateCurrencyAmount, updateQuoteState]
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
    updateQuoteState({ response: null })
  }, [updateQuoteState, onSwitchTokensDefault])

  return {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onSwitchTokens,
  }
}
