import React from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ApproveButton } from 'common/pure/ApproveButton'

import { useApproveCurrency } from '../../hooks/useApproveCurrency'
import { useApproveState } from '../../hooks/useApproveState'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
  isDisabled?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children, isDisabled } = props

  const currency = amountToApprove.currency

  const { state: approvalState } = useApproveState(amountToApprove)

  const handleApprove = useApproveCurrency(amountToApprove)

  return (
    <>
      <ApproveButton isDisabled={isDisabled} currency={currency} onClick={handleApprove} state={approvalState} />

      {children}
    </>
  )
}
