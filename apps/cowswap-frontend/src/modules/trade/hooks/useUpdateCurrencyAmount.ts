import { useCallback } from 'react'

import { FractionUtils, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useTradeState } from 'modules/trade/hooks/useTradeState'

type AmountType = {
  value: string
  isTyped: boolean
}

type UpdateCurrencyAmountProps = {
  currency: Currency | undefined | null
  amount: AmountType
  field: Field
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateCurrencyAmount() {
  const { updateState } = useTradeState()

  return useCallback(
    ({ field, currency, amount }: UpdateCurrencyAmountProps) => {
      if (!currency || !updateState) {
        return
      }

      const { isTyped, value } = amount

      // Value can be from user typed input or from quote API response
      // If the value is 3 ETH for example, first one will be 3 and second one 3 * 10**18
      // So we need to parse them differently to CurrencyAmount and we use isTyped flag for that
      const parsedAmount = isTyped
        ? tryParseCurrencyAmount(value, currency)
        : CurrencyAmount.fromRawAmount(currency, value)

      if (!parsedAmount || parsedAmount.equalTo(0)) {
        updateState({
          inputCurrencyAmount: null,
          outputCurrencyAmount: null,
        })
        return
      }

      const currencyAmount = FractionUtils.serializeFractionToJSON(parsedAmount)
      const currencyField = field === Field.INPUT ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

      updateState({ [currencyField]: currencyAmount })
    },
    [updateState],
  )
}
