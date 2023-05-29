import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { Field } from 'legacy/state/swap/actions'
import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'
import { updateTradeQuoteAtom } from 'modules/tradeQuote'
import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useWalletInfo } from 'modules/wallet'
import { useAdvancedOrdersRawState } from './useAdvancedOrdersRawState'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useUpdateAdvancedOrdersRawState } from './useAdvancedOrdersRawState'
import { FractionUtils } from 'utils/fractionUtils'

// TODO: this should be also unified for each trade widget (swap, limit, advanced)
export function useAdvancedOrdersActions() {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { inputCurrencyId, outputCurrencyId } = useAdvancedOrdersRawState()

  const naviageOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const updateQuoteState = useSetAtom(updateTradeQuoteAtom)
  const updateAdvancedOrderRawState = useUpdateAdvancedOrdersRawState()
  const tradeNavigate = useTradeNavigate()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

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

  const onSwitchTokens = useCallback(() => {
    if (!isWrapOrUnwrap) {
      updateQuoteState({ response: null })
      updateAdvancedOrderRawState({
        inputCurrencyId: outputCurrencyId,
        outputCurrencyId: inputCurrencyId,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
        outputCurrencyAmount: null,
      })
    }

    tradeNavigate(chainId, {
      inputCurrencyId: outputCurrencyId,
      outputCurrencyId: inputCurrencyId,
    })
  }, [
    chainId,
    tradeNavigate,
    updateQuoteState,
    updateAdvancedOrderRawState,
    inputCurrencyId,
    outputCurrencyId,
    outputCurrencyAmount,
    isWrapOrUnwrap,
  ])

  return {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onSwitchTokens,
  }
}
