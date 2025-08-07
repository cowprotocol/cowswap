import React, { ReactNode, useState } from 'react'

import { Currency, CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'

import { useTradeSpenderAddress } from '../../../common/hooks/useTradeSpenderAddress'
import { useApprovalStateForSpender } from '../../../lib/hooks/useApproval'
import { ApprovalState, useApproveCurrency } from '../hooks'
import { ApproveButton, ApproveConfirmation } from '../pure'

const MaxApprovalAmount = BigInt(MaxUint256.toString())

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
  isDisabled?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const { amountToApprove, children } = props

  const currency = amountToApprove.currency

  const [isConfirmationOpen, setIsCOnfirmationOpen] = useState(false)
  const handleApprove = useApproveCurrency(amountToApprove)
  const spender = useTradeSpenderAddress()
  // todo [approve] check the last arg
  const { approvalState, currentAllowance } = useApprovalStateForSpender(amountToApprove, spender, () => false)

  const isDisabled = props.isDisabled || !handleApprove

  if (isConfirmationOpen && handleApprove && approvalState !== ApprovalState.PENDING) {
    return (
      <ApproveConfirmation
        amountToApprove={amountToApprove}
        currentAllowance={currentAllowance}
        handleApprove={handleApprove}
        maxApprovalAmount={MaxApprovalAmount}
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
