import React, { useCallback, useState } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'
import { useZeroApprove } from 'common/hooks/useZeroApprove'
import { ApproveButton } from 'common/pure/ApproveButton'
import { CowModal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { useTradeApproveCallback } from './useTradeApproveCallback'

import { useApproveState } from '../../hooks/useApproveState'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: React.ReactNode
  isDisabled?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps) {
  const { amountToApprove, children, isDisabled } = props

  const currency = amountToApprove.currency

  const approvalState = useApproveState(amountToApprove)
  const tradeApproveCallback = useTradeApproveCallback(amountToApprove)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)
  const zeroApprove = useZeroApprove(amountToApprove.currency)
  const [error, setError] = useState<string | null>(null)
  const onDismissError = () => setError(null)

  const handleApprove = useCallback(async () => {
    try {
      if (shouldZeroApprove) {
        await zeroApprove()
      }
      await tradeApproveCallback()
    } catch (error) {
      setError(typeof error === 'string' ? error : error.message || error.toString())
    }
  }, [tradeApproveCallback, zeroApprove, shouldZeroApprove, setError])

  return (
    <>
      <CowModal isOpen={!!error} onDismiss={onDismissError}>
        {error && <TransactionErrorContent message={error} onDismiss={onDismissError} />}
      </CowModal>

      <ApproveButton isDisabled={isDisabled} currency={currency} onClick={handleApprove} state={approvalState} />

      {children}
    </>
  )
}
