export enum SmartOrderStatus {
  CREATING = 'CREATING',
  CREATION_MINED = 'CREATED',
  INDEXED = 'INDEXED',
  FILLED = 'FILLED',
}

export type TxState = {
  /**
   * undefined: there's no tx to track
   * string: tx was created and can be tracked
   */
  hash?: string
  /**
   * undefined: not started/mining
   * true: transaction failed
   * false: transaction succeeded
   */
  failed?: boolean
  cancelled?: boolean
  spedUp?: boolean
  replaced?: boolean
}

export interface EthFlowStepperProps {
  showProgressBar?: boolean
  nativeTokenSymbol: string
  tokenLabel: string

  order: {
    orderId: string
    state: SmartOrderStatus
    /**
     * To track if the order is past the expiration date
     */
    isExpired: boolean
    /**
     * To track if the order has been created on the backend
     */
    isCreated: boolean
    rejectedReason?: string
  }

  /**
   * To track smart order tx creation
   */
  creation: TxState

  /**
   * To track refund tx
   */
  refund: TxState

  /**
   * To track cancellation tx
   */
  cancellation: TxState
}
