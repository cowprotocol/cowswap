import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { maxUint256, toHex } from 'viem'

import { useApproveCurrency } from 'modules/erc20Approve'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

export function useOrdersTableTokenApprove(): Dispatch<SetStateAction<Token | undefined>> {
  const [tokenToApprove, setTokenToApprove] = useState<Token | undefined>(undefined)

  // Infinite amount
  const amountToApprove = useMemo(() => {
    return tokenToApprove ? CurrencyAmount.fromRawAmount(tokenToApprove, toHex(maxUint256)) : undefined
  }, [tokenToApprove])

  const tradeApproveCallback = useApproveCurrency(amountToApprove)

  // Trigger approve flow once amountToApprove is set
  useSafeEffect(() => {
    if (amountToApprove && tradeApproveCallback) {
      tradeApproveCallback(BigInt(amountToApprove.quotient.toString()))
      setTokenToApprove(undefined)
    }
  }, [amountToApprove, tradeApproveCallback])

  return setTokenToApprove
}
