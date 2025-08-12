import React, { ReactNode, useState } from 'react'

import { Currency, CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'

import { useHasPendingOrdersWithPermitForInputToken } from 'common/hooks/useHasPendingOrdersWithPermit'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

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

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const handleApprove = useApproveCurrency(amountToApprove)
  const spender = useTradeSpenderAddress()
  const { approvalState, currentAllowance } = useApprovalStateForSpender(amountToApprove, spender)

  const isDisabled = props.isDisabled || !handleApprove

  const disablePartialApproval = useHasPendingOrdersWithPermitForInputToken(amountToApprove.currency)
  console.log('disablePartialApproval', disablePartialApproval)

  if (isConfirmationOpen && handleApprove && approvalState !== ApprovalState.PENDING) {
    return (
      <ApproveConfirmation
        amountToApprove={amountToApprove}
        currentAllowance={currentAllowance}
        handleApprove={handleApprove}
        maxApprovalAmount={MaxApprovalAmount}
        disablePartialApproval={disablePartialApproval}
      />
    )
  }

  return (
    <ApproveButton
      isDisabled={isDisabled || !handleApprove}
      currency={currency}
      onClick={() => setIsConfirmationOpen(true)}
      state={approvalState}
    >
      {children}
    </ApproveButton>
  )
}
