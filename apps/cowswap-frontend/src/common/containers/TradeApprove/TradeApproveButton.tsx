import React, { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

import { ApproveButton } from 'common/pure/ApproveButton'

import { useTradeApproveCallback } from './useTradeApproveCallback'

import { useApproveState } from '../../hooks/useApproveState'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
  isDisabled?: boolean
  isPartialApprove?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children, isDisabled, isPartialApprove } = props

  const currency = amountToApprove.currency

  const { state: approvalState } = useApproveState(amountToApprove)
  const tradeApproveCallback = useTradeApproveCallback(amountToApprove, isPartialApprove)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)
  const zeroApprove = useZeroApprove(amountToApprove.currency)

  const handleApprove = useCallback(async () => {
    if (shouldZeroApprove) {
      await zeroApprove()
    }

    await tradeApproveCallback()
  }, [tradeApproveCallback, zeroApprove, shouldZeroApprove])

  return (
    <>
      <ApproveButton isDisabled={isDisabled} currency={currency} onClick={handleApprove} state={approvalState} />

      {children}
    </>
  )
}
