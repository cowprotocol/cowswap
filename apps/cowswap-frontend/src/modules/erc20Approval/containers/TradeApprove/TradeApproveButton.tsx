import { ReactNode, useState } from 'react'

import { useTokensAllowances } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCurrency } from '../../hooks/useApproveCurrency'
import { useApproveState } from '../../hooks/useApproveState'
import { ApproveButton } from '../../pure/ApproveButton'
import { ApproveConfirmation } from '../../pure/ApproveConfirmation'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children } = props

  const currency = amountToApprove.currency

  const [isConfirmationOpen, setIsCOnfirmationOpen] = useState(false)
  const { state: approvalState } = useApproveState(amountToApprove)
  const handleApprove = useApproveCurrency(amountToApprove)
  const { values: allowances } = useTokensAllowances()
  const currentAllowance = allowances[getCurrencyAddress(currency).toLowerCase()]

  const isDisabled = props.isDisabled || !handleApprove

  if (isConfirmationOpen) {
    return (
      <ApproveConfirmation
        amountToApprove={amountToApprove}
        currentAllowance={currentAllowance}
        handleApprove={handleApprove}
      />
    )
  }

  return (
    <ApproveButton
      isDisabled={isDisabled || !handleApprove}
      currency={currency}
      onClick={() => setIsCOnfirmationOpen(true)}
      state={approvalState}
    >
      {children}
    </ApproveButton>
  )
}
