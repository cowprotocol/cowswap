import ms from 'ms.macro'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Percent } from '@uniswap/sdk-core'

export const DEFAULT_TWAP_SLIPPAGE = new Percent(10, 100) // 10%

export type OrderDeadline = { label: string; value: number }

export const defaultNumOfParts = 1

export const defaultOrderDeadline: OrderDeadline = { label: '1 Hour', value: ms`1 hour` }

export const orderDeadlines: OrderDeadline[] = [
  { label: '5 Minutes', value: ms`5m` },
  { label: '30 Minutes', value: ms`30m` },
  defaultOrderDeadline,
  { label: '1 Day', value: ms`1d` },
  { label: '3 Days', value: ms`3d` },
  { label: '7 Days', value: ms`7d` },
  { label: '1 Month', value: ms`30d` },
]

export const TWAP_ORDER_STRUCT =
  'tuple(address sellToken,address buyToken,address receiver,uint256 partSellAmount,uint256 minPartLimit,uint256 t0,uint256 n,uint256 t,uint256 span)'

export const TWAP_HANDLER_ADDRESS: Record<SupportedChainId, string> = {
  1: 'TODO',
  100: 'TODO',
  5: '0xa12d770028d7072b80baeb6a1df962374fd13d9a',
}
