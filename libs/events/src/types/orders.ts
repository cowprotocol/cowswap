import { OrderKind, SupportedChainId, EnrichedOrder } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

export interface OrderUidInChain {
  orderUid: string
  chainId: SupportedChainId
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}

export type TokenInfo = {
  chainId: number
  address: string
  name: string
  decimals: number
  symbol: string
  logoURI?: string
}

export type OnPostedOrderPayload = {
  orderUid: string
  orderCreationHash?: string
  chainId: SupportedChainId
  owner: string
  kind: OrderKind
  orderType: UiOrderType
  inputAmount: bigint
  outputAmount: bigint
  inputToken: TokenInfo
  outputToken: TokenInfo
  isEthFlow?: boolean
  receiver?: string
}
export type OnFulfilledOrderPayload = {
  chainId: SupportedChainId
  order: EnrichedOrder
}

export type OnRejectedOrderPayload = OrderUidInChain & {
  reason: string
  errorCode?: number
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}
