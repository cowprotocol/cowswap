import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { MaxUint256 } from '@ethersproject/constants'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'
import { useSafeEffect } from 'common/hooks/useSafeMemo'

export function useOrdersTableTokenApprove(): Dispatch<SetStateAction<Token | undefined>> {
  const [tokenToApprove, setTokenToApprove] = useState<Token | undefined>(undefined)

  // Infinite amount
  const amountToApprove = useMemo(() => {
    return tokenToApprove ? CurrencyAmount.fromRawAmount(tokenToApprove, MaxUint256.toString()) : undefined
  }, [tokenToApprove])

  const tradeApproveCallback = useTradeApproveCallback(amountToApprove)

  // Trigger approve flow once amountToApprove is set
  useSafeEffect(() => {
    if (amountToApprove) {
      tradeApproveCallback().finally(() => {
        setTokenToApprove(undefined)
      })
    }
  }, [amountToApprove, tradeApproveCallback])

  return setTokenToApprove
}
