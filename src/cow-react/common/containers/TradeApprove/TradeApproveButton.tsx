import React from 'react'
import { ApproveButton } from '@cow/modules/shared/dumb/ApproveButton'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useTradeApproveCallback } from './useTradeApproveCallback'
import { useTradeApproveState } from './useTradeApproveState'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children } = props

  const currency = amountToApprove.currency

  const approvalState = useTradeApproveState(amountToApprove)
  const handleApprove = useTradeApproveCallback(amountToApprove)

  return (
    <>
      <ApproveButton currency={currency} onClick={handleApprove} state={approvalState} />

      {children}
    </>
  )
}
