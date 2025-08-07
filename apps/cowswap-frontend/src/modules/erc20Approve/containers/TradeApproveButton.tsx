import React, { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCurrency } from '../../../common/hooks/useApproveCurrency'
import { useApproveState } from '../../../common/hooks/useApproveState'
import { ApproveButton } from '../../../common/pure/ApproveButton'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
  isDisabled?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
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
