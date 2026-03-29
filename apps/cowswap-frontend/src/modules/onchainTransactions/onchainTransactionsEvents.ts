import { SimpleCowEventEmitter } from '@cowprotocol/events'

import type { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import type { TransactionReceipt } from 'viem'

interface FinalizeTxPayload {
  receipt: TransactionReceipt
  transaction: EnhancedTransactionDetails
}

interface TxReplacedPayload {
  transaction: EnhancedTransactionDetails
}

export enum OnchainTxEvents {
  BEFORE_TX_FINALIZE = 'BEFORE_TX_FINALIZE',
  TX_REPLACED = 'TX_REPLACED',
}

// Define types for event payloads
export interface OnchainTxEventPayloadMap {
  [OnchainTxEvents.BEFORE_TX_FINALIZE]: FinalizeTxPayload
  [OnchainTxEvents.TX_REPLACED]: TxReplacedPayload
}

export const ONCHAIN_TRANSACTIONS_EVENTS = Object.freeze(
  new SimpleCowEventEmitter<OnchainTxEventPayloadMap, OnchainTxEvents>(),
)
