import React, { ReactNode } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { Currency, CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'

import { useApprovalStateForSpender, useApproveCurrency } from '../../hooks'
import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { useIsPartialApproveSelectedByUser } from '../../state'

const MaxApprovalAmount = BigInt(MaxUint256.toString())

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
  enablePartialApprove?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const { amountToApprove, children, enablePartialApprove } = props
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const handleApprove = useApproveCurrency(amountToApprove)
  const spender = useTradeSpenderAddress()
  const { approvalState } = useApprovalStateForSpender(amountToApprove, spender)
  if (!enablePartialApprove) {
    return (
      <>
        <LegacyApproveButton
          currency={amountToApprove.currency}
          state={approvalState}
          onClick={() => handleApprove(MaxApprovalAmount)}
        ></LegacyApproveButton>
        {children}
      </>
    )
  }

  const toApprove = isPartialApproveEnabledByUser ? BigInt(amountToApprove.quotient.toString()) : MaxApprovalAmount
  return <div onClick={() => handleApprove(toApprove)}>{children}</div>
}
