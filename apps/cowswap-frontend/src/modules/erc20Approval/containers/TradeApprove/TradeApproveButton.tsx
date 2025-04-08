import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCurrency } from '../../hooks/useApproveCurrency'
import { useApproveState } from '../../hooks/useApproveState'
import { ApproveButton } from '../../pure/ApproveButton'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children, isDisabled } = props

  const currency = amountToApprove.currency

  const { state: approvalState } = useApproveState(amountToApprove)

  const handleApprove = useApproveCurrency(amountToApprove)

  return (
    <>
      <ApproveButton isDisabled={isDisabled} currency={currency} onClick={handleApprove} state={approvalState}>
        {children}
      </ApproveButton>
    </>
  )
}
