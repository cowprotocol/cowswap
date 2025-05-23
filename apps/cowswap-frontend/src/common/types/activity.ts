import { GnosisSafeInfo } from '@cowprotocol/wallet'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import type { Order } from 'legacy/state/orders/actions'

export enum ActivityType {
  ORDER = 'order',
  TX = 'tx',
}

export enum ActivityStatus {
  PENDING,
  PRESIGNATURE_PENDING,
  CONFIRMED,
  EXPIRED,
  CANCELLING,
  CANCELLED,
  CREATING,
  FAILED,
}

export interface OrderCreationTxInfo {
  orderCreationTx: EnhancedTransactionDetails
  orderCreationLinkedTx?: EnhancedTransactionDetails
}

/**
 * Object derived from the activity state
 */
export interface ActivityDerivedState {
  id: string
  status: ActivityStatus
  type: ActivityType
  summary?: string
  activityLinkUrl?: string

  // Convenient flags
  isTransaction: boolean
  isOrder: boolean
  isPending: boolean
  isConfirmed: boolean
  isExpired: boolean
  isCancelling: boolean
  isCancelled: boolean
  isReplaced: boolean
  isPresignaturePending: boolean
  isUnfillable?: boolean
  // EthFlow flags
  isCreating: boolean
  isFailed: boolean
  // TODO: refactor these convenience flags

  // Possible activity types
  enhancedTransaction?: EnhancedTransactionDetails
  order?: Order

  // Gnosis Safe
  gnosisSafeInfo?: GnosisSafeInfo

  // Eth-flow order related transactions
  orderCreationTxInfo?: OrderCreationTxInfo
}
