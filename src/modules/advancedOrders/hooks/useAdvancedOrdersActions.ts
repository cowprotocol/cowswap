import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/swap/actions'

import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { updateTradeQuoteAtom } from 'modules/tradeQuote'

import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'

// TODO: this should be also unified for each trade widget (swap, limit, advanced)
export function useAdvancedOrdersActions() {
  const { inputCurrency } = useAdvancedOrdersDerivedState()

  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const updateQuoteState = useSetAtom(updateTradeQuoteAtom)

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
      updateCurrencyAmount({
        amount: { isTyped: true, value: typedValue },
        currency: inputCurrency,
        field,
      })
    },
    [inputCurrency, updateCurrencyAmount]
  )

  // TODO: implement this one
  const onChangeRecipient = useCallback(() => {
    console.log('On change recipient')
  }, [])

  // TODO: implement this one
  const onSwitchTokens = useCallback(() => {
    console.log('On switch tokens')
  }, [])

  return {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onSwitchTokens,
  }
}
