import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface OrderUidInChain {
  orderUid: string
  chainId: SupportedChainId
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}

export type OnPostedOrderPayload = OrderUidInChain
export type OnExecutedOrderPayload = OrderUidInChain

export type OnPostedEthFlowOrderPayload = OrderUidInChain & {
  txHash: string
}

export type OnRejectedOrderPayload = OrderUidInChain & {
  reason: string
  errorCode?: number
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}
