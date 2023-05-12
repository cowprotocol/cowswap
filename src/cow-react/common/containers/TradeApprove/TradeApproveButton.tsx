import React, { useCallback } from 'react'
import { ApproveButton } from '@cow/common/pure/ApproveButton'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useTradeApproveCallback } from './useTradeApproveCallback'
import { useTradeApproveState } from './useTradeApproveState'
import { ApprovalState } from '@src/hooks/useApproveCallback'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children } = props

  const currency = amountToApprove.currency

  const approvalState = useTradeApproveState(amountToApprove)
  const handleApprove = useTradeApproveCallback(amountToApprove)

  const approveOrDisapprove = useCallback(() => {
    if (approvalState === ApprovalState.NOT_APPROVED_NEEDS_TO_SET_TO_ZERO) {
      alert('NOT_APPROVED_NEEDS_TO_SET_TO_ZERO')
    } else {
      handleApprove()
    }
  }, [approvalState, handleApprove])

  return (
    <>
      <ApproveButton currency={currency} onClick={approveOrDisapprove} state={approvalState} />

      {children}
    </>
  )
}
