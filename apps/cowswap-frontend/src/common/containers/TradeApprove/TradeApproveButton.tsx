import React, { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'
import { useZeroApprove } from 'common/hooks/useZeroApprove'
import { ApproveButton } from 'common/pure/ApproveButton'

import { useTradeApproveCallback } from './useTradeApproveCallback'
import { useTradeApproveState } from './useTradeApproveState'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
  isDisabled?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children, isDisabled } = props

  const currency = amountToApprove.currency

  const approvalState = useTradeApproveState(amountToApprove)
  const tradeApproveCallback = useTradeApproveCallback(amountToApprove)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)
  const zeroApprove = useZeroApprove(amountToApprove.currency)

  const handleApprove = useCallback(async () => {
    if (shouldZeroApprove) {
      await zeroApprove()
    }
    await tradeApproveCallback()
  }, [tradeApproveCallback, zeroApprove, shouldZeroApprove])

  return (
    <>
      <ApproveButton isDisabled={isDisabled} currency={currency} onClick={handleApprove} state={approvalState} />

      {children}
    </>
  )
}
