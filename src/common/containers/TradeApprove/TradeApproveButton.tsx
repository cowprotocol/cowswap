import React, { useCallback } from 'react'
import { ApproveButton } from 'common/pure/ApproveButton'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useTradeApproveCallback } from './useTradeApproveCallback'
import { useTradeApproveState } from './useTradeApproveState'
import { useZeroApprove } from 'common/hooks/useZeroApprove'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children } = props

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
      <ApproveButton currency={currency} onClick={handleApprove} state={approvalState} />

      {children}
    </>
  )
}
