import { useAtom } from 'jotai'
import { tradeApproveStateAtom } from './tradeApproveStateAtom'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import React from 'react'

export function TradeApproveWidget() {
  const [{ approveInProgress, currency }, setState] = useAtom(tradeApproveStateAtom)

  return (
    <TransactionConfirmationModal
      isOpen={approveInProgress}
      operationType={OperationType.APPROVE_TOKEN}
      currencyToAdd={currency}
      pendingText={`Approving ${currency?.symbol} for trading`}
      onDismiss={() => setState({ currency, approveInProgress: false })}
      attemptingTxn={true}
    />
  )
}
