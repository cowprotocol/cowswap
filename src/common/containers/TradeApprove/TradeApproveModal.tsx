import { useAtom } from 'jotai'
import { tradeApproveStateAtom } from './tradeApproveStateAtom'
import TransactionConfirmationModal, { OperationType } from 'legacy/components/TransactionConfirmationModal'
import React from 'react'
import { TokenSymbol } from 'common/pure/TokenSymbol'

export function TradeApproveModal() {
  const [{ approveInProgress, currency }, setState] = useAtom(tradeApproveStateAtom)

  return (
    <TransactionConfirmationModal
      isOpen={approveInProgress}
      operationType={OperationType.APPROVE_TOKEN}
      currencyToAdd={currency}
      pendingText={
        <>
          Approving <TokenSymbol token={currency} /> for trading
        </>
      }
      onDismiss={() => setState({ currency, approveInProgress: false })}
      attemptingTxn={true}
    />
  )
}
