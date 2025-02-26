import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { MaxUint256 } from '@ethersproject/constants'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useApproveCurrency } from 'common/hooks/useApproveCurrency'
import { useSafeEffect } from 'common/hooks/useSafeMemo'

export function useOrdersTableTokenApprove(): Dispatch<SetStateAction<Token | undefined>> {
  const [tokenToApprove, setTokenToApprove] = useState<Token | undefined>(undefined)

  // Infinite amount
  const amountToApprove = useMemo(() => {
    return tokenToApprove ? CurrencyAmount.fromRawAmount(tokenToApprove, MaxUint256.toString()) : undefined
  }, [tokenToApprove])

  const tradeApproveCallback = useApproveCurrency(amountToApprove)

  // Trigger approve flow once amountToApprove is set
  useSafeEffect(() => {
    if (amountToApprove && tradeApproveCallback) {
      tradeApproveCallback()
      setTokenToApprove(undefined)
    }
  }, [amountToApprove, tradeApproveCallback])

  return setTokenToApprove
}
