import { useAtom } from 'jotai'
import React from 'react'

import TransactionConfirmationModal, { OperationType } from 'legacy/components/TransactionConfirmationModal'

import { TokenSymbol } from 'common/pure/TokenSymbol'

import { tradeApproveStateAtom } from './tradeApproveStateAtom'

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
