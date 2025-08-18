import React, { ReactNode, useState } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'

import { useHasPendingOrdersWithPermitForInputToken } from 'common/hooks/useHasPendingOrdersWithPermit'

import { useApprovalStateForSpender, useApproveCurrency } from '../../hooks'
import { ApproveButton, ApproveConfirmation } from '../../pure'
import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { ApprovalState } from '../../types/approval-state'

const MaxApprovalAmount = BigInt(MaxUint256.toString())

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
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

  const { isPartialApproveEnabled } = useFeatureFlags()

  if (!isPartialApproveEnabled) {
    return (
      <>
        <LegacyApproveButton
          currency={currency}
          state={approvalState}
          onClick={() => handleApprove(MaxApprovalAmount)}
        />
        {children}
      </>
    )
  }

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
