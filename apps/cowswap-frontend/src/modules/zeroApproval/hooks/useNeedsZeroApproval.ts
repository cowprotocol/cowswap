import { useEffect, useState } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'
import { useConfig } from 'wagmi'

import { shouldZeroApprove as shouldZeroApproveFn } from './useShouldZeroApprove/shouldZeroApprove'

export function useNeedsZeroApproval(
  tokenAddress: Nullish<string>,
  spender: Nullish<string>,
  sellAmount: Nullish<CurrencyAmount<Token>>,
): boolean {
  const config = useConfig()

  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)

  useEffect(() => {
    if (!tokenAddress || !spender || !sellAmount) return

    shouldZeroApproveFn({
      tokenAddress,
      spender: spender,
      amountToApprove: sellAmount,
      forceApprove: true,
      config,
    }).then((res) => {
      setShouldZeroApprove(!!res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, sellAmount?.quotient?.toString(), spender])

  return shouldZeroApprove
}
