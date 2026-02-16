import { useMemo } from 'react'

import { isEnoughAmount, getWrappedToken, getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTokenAllowance } from './useTokenAllowance'

export function useEnoughAllowance(amount: CurrencyAmount<Currency> | undefined): boolean | undefined {
  const currency = amount?.currency
  const token = useMemo(() => currency && getWrappedToken(currency), [currency])
  const allowance = useTokenAllowance(token)

  return useMemo(() => {
    if (amount && getIsNativeToken(amount.currency)) {
      return true
    }

    return amount && isEnoughAmount(amount, allowance)
  }, [amount, allowance])
}
