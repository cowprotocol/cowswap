import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useAmountsToSignFromQuote } from 'modules/trade'

import { useGetUserApproveAmountState } from '../state'

/**
 * Returns the partial amount to sign for the approval transaction/permit
 * It compares the maximum maximumSendSellAmount amount with the amount set by the user
 * and returns the higher of the two.
 * If the user hasn't set an amount, it returns the maximum maximumSendSellAmount amount.
 */
export function useGetPartialAmountToSignApprove(): CurrencyAmount<Currency> | null {
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}
  const { amountSetByUser } = useGetUserApproveAmountState() || {}

  return useMemo(() => {
    if (!maximumSendSellAmount) return null
    if (!amountSetByUser || amountSetByUser.equalTo('0')) {
      return maximumSendSellAmount
    }

    const areCurrenciesEqualAndUserAmountIsHigher =
      amountSetByUser.currency.equals(maximumSendSellAmount.currency) &&
      amountSetByUser.greaterThan(maximumSendSellAmount)

    return areCurrenciesEqualAndUserAmountIsHigher ? amountSetByUser : maximumSendSellAmount
  }, [maximumSendSellAmount, amountSetByUser])
}
