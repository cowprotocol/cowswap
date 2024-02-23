import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

export interface OrderUidInChain {
  orderUid: string
  chainId: SupportedChainId
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}

type TokenInfo = {
  chainId: number
  address: string
  name: string
  decimals: number
  symbol: string
  logoURI?: string
}

export type OnPostedOrderPayload = {
  orderUid: string
  chainId: SupportedChainId
  owner: string
  kind: OrderKind
  orderType: UiOrderType
  inputAmount: bigint
  outputAmount: bigint
  inputToken: TokenInfo
  outputToken: TokenInfo
  receiver?: string
}
export type OnExecutedOrderPayload = OrderUidInChain

export type OnPostedEthFlowOrderPayload = OrderUidInChain & {
  txHash: string
}

export type OnRejectedOrderPayload = OrderUidInChain & {
  reason: string
  errorCode?: number
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}
