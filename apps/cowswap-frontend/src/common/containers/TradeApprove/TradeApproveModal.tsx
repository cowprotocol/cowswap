import { useAtom } from 'jotai'
import React from 'react'

import { TokenSymbol } from '@cowprotocol/ui'

import { TransactionConfirmationModal } from 'legacy/components/TransactionConfirmationModal'
import { ConfirmOperationType } from 'legacy/state/types'

import { tradeApproveStateAtom } from './tradeApproveStateAtom'

export function TradeApproveModal() {
  const [{ approveInProgress, currency }, setState] = useAtom(tradeApproveStateAtom)

  return (
    <TransactionConfirmationModal
      isOpen={approveInProgress}
      operationType={ConfirmOperationType.APPROVE_TOKEN}
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
