import { useCallback } from 'react'
import { Field } from 'state/swap/actions'
import { Currency } from '@uniswap/sdk-core'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'
import { useOnCurrencySelection as useOnCurrencySelectionCommon } from '@cow/modules/trade/hooks/useOnCurrencySelection'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useUpdateAtom } from 'jotai/utils'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders'
import { FractionUtils } from '@cow/utils/fractionUtils'

export function useOnCurrencySelection(): (field: Field, currency: Currency | null) => void {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()
  const onCurrencySelectionCommon = useOnCurrencySelectionCommon()
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

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
        const targetCurrency = field === Field.INPUT ? inputCurrency : outputCurrency

        if (targetCurrency && amount) {
          const prevDecimals = targetCurrency.decimals
          const newDecimals = currency.decimals

          updateLimitOrdersState({
            [amountField]: FractionUtils.serializeFractionToJSON(adjustDecimals(amount, prevDecimals, newDecimals)),
          })
        }
      }

      return onCurrencySelectionCommon(field, currency)
    },
    [
      onCurrencySelectionCommon,
      updateLimitOrdersState,
      inputCurrency,
      inputCurrencyAmount,
      outputCurrency,
      outputCurrencyAmount,
    ]
  )
}
