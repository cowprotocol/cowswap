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

export type BaseOrderPayload = {
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

export type OnPostedOrderPayload = BaseOrderPayload & {
  orderCreationHash?: string
  isEthFlow?: boolean
}

export type OnFulfilledOrderPayload = {
  chainId: SupportedChainId
  order: EnrichedOrder
}

export type OnCancelledOrderPayload = {
  chainId: SupportedChainId
  orderUid: string
  transactionHash?: string
}
