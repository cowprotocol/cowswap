import { useCallback } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { convertAmountToCurrency } from 'utils/orderUtils/calculateExecutionPrice'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useNavigateOnCurrencySelection } from './useNavigateOnCurrencySelection'
import { useTradeState } from './useTradeState'

export function useOnCurrencySelection(): (field: Field, currency: Currency | null, callback?: Command) => void {
  const { inputCurrencyAmount, outputCurrencyAmount } = useDerivedTradeState() || {}
  const navigateOnCurrencySelection = useNavigateOnCurrencySelection()
  const { updateState } = useTradeState()

  return useCallback(
    (field: Field, currency: Currency | null, callback?: Command) => {
      if (!currency) return
      /**
       * Since we store quotient value in the store, we must adjust the value regarding a currency decimals
       * For example, we selected USDC (6 decimals) as input currency and entered "6" as amount
       * Then we change the input currency from USDC to WETH (18 decimals)
       * In the store we have inputCurrencyAmount = 6000000
       * Before changing the input currency we must adjust the inputCurrencyAmount for the new currency decimals
       * 6000000 must be converted to 6000000000000000000
       */
      const amountField = field === Field.INPUT ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

      const amount = field === Field.INPUT ? inputCurrencyAmount : outputCurrencyAmount

      if (amount) {
        const converted = convertAmountToCurrency(amount, currency)

        return navigateOnCurrencySelection(field, currency, () => {
          updateState?.({
            [amountField]: FractionUtils.serializeFractionToJSON(converted),
          })
          callback?.()
        })
      }

      return navigateOnCurrencySelection(field, currency, callback)
    },
    [navigateOnCurrencySelection, updateState, inputCurrencyAmount, outputCurrencyAmount],
  )
}
