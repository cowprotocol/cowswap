import { useEffect, useState } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { Nullish } from 'types'
import { useConfig } from 'wagmi'

import { shouldZeroApprove as shouldZeroApproveFn } from './useShouldZeroApprove/shouldZeroApprove'

export function useNeedsZeroApproval(
  token: Nullish<Token>,
  spender: Nullish<string>,
  sellAmount: Nullish<CurrencyAmount<Token>>,
): boolean {
  const config = useConfig()
  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)

  useEffect(() => {
    if (!token?.address || !spender || !sellAmount || !config) return

    shouldZeroApproveFn({
      tokenAddress: token.address,
      spender,
      amountToApprove: sellAmount,
      forceApprove: true,
      config,
    }).then((res) => {
      setShouldZeroApprove(!!res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.address, sellAmount?.quotient?.toString(), spender, config])

  return shouldZeroApprove
}
