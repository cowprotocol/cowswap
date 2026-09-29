import { useEffect, useState } from 'react'

import { useConfig } from 'wagmi'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { shouldZeroApprove as shouldZeroApproveFn } from './useShouldZeroApprove/shouldZeroApprove'

export function useNeedsZeroApproval(
  inputAmount: Nullish<CurrencyAmount<Token>>,
  amountToApprove: Nullish<bigint>,
  needsApproval: boolean,
): boolean {
  const spender = useTradeSpenderAddress()
  const { account } = useWalletInfo()
  const token = inputAmount ? getWrappedToken(inputAmount.currency) : undefined
  const tokenAddress = token?.address
  const config = useConfig()
  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)

  useEffect(() => {
    if (!needsApproval || !tokenAddress || !spender || !amountToApprove || !account || !config) {
      setShouldZeroApprove(false)
      return
    }

    let cancelled = false

    shouldZeroApproveFn({
      tokenAddress,
      owner: account,
      spender,
      amountToApprove,
      forceApprove: true,
      config,
    }).then((res) => {
      if (cancelled) return
      setShouldZeroApprove(!!res)
    })

    return () => {
      cancelled = true
    }
  }, [needsApproval, tokenAddress, spender, account, amountToApprove, config])

  return shouldZeroApprove
}
