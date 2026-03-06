import { SimpleCowEventEmitter } from '@cowprotocol/events'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

import type { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

// Define types for event payloads
export interface OnchainTxEventPayloadMap {
  [OnchainTxEvents.BEFORE_TX_FINALIZE]: FinalizeTxPayload
}

export enum OnchainTxEvents {
  BEFORE_TX_FINALIZE = 'BEFORE_TX_FINALIZE',
}

interface FinalizeTxPayload {
  receipt: TransactionReceipt
  transaction: EnhancedTransactionDetails
}

export const ONCHAIN_TRANSACTIONS_EVENTS = Object.freeze(
  new SimpleCowEventEmitter<OnchainTxEventPayloadMap, OnchainTxEvents>(),
)
