import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { Currency } from '@uniswap/sdk-core'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { Field } from 'legacy/state/swap/actions'
import { updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'
import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'

// TODO: this should be also unified for each trade widget (swap, limit, advanced)
export function useAdvancedOrdersActions() {
  const { inputCurrency } = useAdvancedOrdersDerivedState()

  const updateAdvancedOrdersState = useUpdateAtom(updateAdvancedOrdersAtom)
  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

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
    },
    [naviageOnCurrencySelection, updateCurrencyAmount]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      updateCurrencyAmount({
        amount: { isTyped: true, value: typedValue },
        currency: inputCurrency,
        field,
      })
    },
    [inputCurrency, updateAdvancedOrdersState, updateCurrencyAmount]
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
