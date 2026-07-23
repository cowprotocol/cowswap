import { useEffect, useState } from 'react'

import { useConfig } from 'wagmi'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { shouldZeroApprove as shouldZeroApproveFn } from './useShouldZeroApprove/shouldZeroApprove'

export function useNeedsZeroApproval(amount: Nullish<CurrencyAmount<Token>>, needsApproval: boolean): boolean {
  const spender = useTradeSpenderAddress()
  const token = amount ? getWrappedToken(amount.currency) : undefined
  const tokenAddress = token?.address
  const config = useConfig()
  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)

  useEffect(() => {
    if (!needsApproval || !tokenAddress || !spender || !amount || !config) return

    shouldZeroApproveFn({
      tokenAddress,
      spender,
      amountToApprove: amount,
      forceApprove: true,
      config,
    }).then((res) => {
      setShouldZeroApprove(!!res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsApproval, tokenAddress, spender, amount?.quotient?.toString(), config])

  return shouldZeroApprove
}
