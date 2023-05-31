import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/swap/actions'

import { updateLimitOrdersRawStateAtom } from 'modules/limitOrders'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { convertAmountToCurrency } from 'modules/limitOrders/utils/calculateExecutionPrice'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'

import { FractionUtils } from 'utils/fractionUtils'

export function useOnCurrencySelection(): (field: Field, currency: Currency | null) => void {
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()
  const navigateOnCurrencySelection = useNavigateOnCurrencySelection()
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)

  return useCallback(
    (field: Field, currency: Currency | null) => {
      /**
       * Since we store quotient value in the store, we must adjust the value regarding a currency decimals
       * For example, we selected USDC (6 decimals) as input currency and entered "6" as amount
       * Then we change the input currency from USDC to WETH (18 decimals)
       * In the store we have inputCurrencyAmount = 6000000
       * Before changing the input currency we must adjust the inputCurrencyAmount for the new currency decimals
       * 6000000 must be converted to 6000000000000000000
       */
      if (currency) {
        const amountField = field === Field.INPUT ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

        const amount = field === Field.INPUT ? inputCurrencyAmount : outputCurrencyAmount

        if (amount) {
          const converted = convertAmountToCurrency(amount, currency)

          return navigateOnCurrencySelection(field, currency, () => {
            updateLimitOrdersState({
              [amountField]: FractionUtils.serializeFractionToJSON(converted),
            })
          })
        }
      }

      return navigateOnCurrencySelection(field, currency)
    },
    [navigateOnCurrencySelection, updateLimitOrdersState, inputCurrencyAmount, outputCurrencyAmount]
  )
}
