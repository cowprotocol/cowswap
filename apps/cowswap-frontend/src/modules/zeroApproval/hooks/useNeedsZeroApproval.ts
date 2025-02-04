import { useEffect, useState } from 'react'

import { Erc20 } from '@cowprotocol/abis'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { shouldZeroApprove as shouldZeroApproveFn } from './useShouldZeroApprove/shouldZeroApprove'

export function useNeedsZeroApproval(
  erc20Contract: Nullish<Erc20>,
  spender: Nullish<string>,
  sellAmount: Nullish<CurrencyAmount<Token>>,
): boolean {
  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)

  useEffect(() => {
    if (!erc20Contract || !spender || !sellAmount) return

    shouldZeroApproveFn({
      tokenContract: erc20Contract,
      spender: spender,
      amountToApprove: sellAmount,
      isBundle: true,
    }).then((res) => {
      setShouldZeroApprove(!!res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Contract?.address, sellAmount?.quotient?.toString(), spender])

  return shouldZeroApprove
}
