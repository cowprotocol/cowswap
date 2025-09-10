import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useAmountsToSign } from 'modules/trade'

import { useGetUserApproveAmountState } from '../state'

/**
 * Returns the amount to sign for the approval transaction.
 * It compares the maximum maximumSendSellAmount amount with the amount set by the user
 * and returns the higher of the two.
 * If the user hasn't set an amount, it returns the maximum maximumSendSellAmount amount.
 */
export function useGetAmountToSignApprove(): CurrencyAmount<Currency> | undefined {
  const { maximumSendSellAmount } = useAmountsToSign() || {}
  const { amountSetByUser } = useGetUserApproveAmountState() || {}

  return useMemo(() => {
    if (!maximumSendSellAmount) return undefined

    // todo fix case with native token
    const areCurrenciesEqualAndUserAmountIsHigher =
      amountSetByUser &&
      amountSetByUser.currency.equals(maximumSendSellAmount.currency) &&
      amountSetByUser.greaterThan(maximumSendSellAmount)

    return areCurrenciesEqualAndUserAmountIsHigher ? amountSetByUser : maximumSendSellAmount
  }, [maximumSendSellAmount, amountSetByUser])
}
