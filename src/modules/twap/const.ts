import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { USDC } from 'legacy/constants/tokens'

import { TwapOrderStatus } from './types'

export const DEFAULT_TWAP_SLIPPAGE = new Percent(10, 100) // 10%

export type OrderDeadline = { label: string; value: number }

export const DEFAULT_NUM_OF_PARTS = 2

export const DEFAULT_ORDER_DEADLINE: OrderDeadline = { label: '1 Hour', value: ms`1 hour` }

export const ORDER_DEADLINES: OrderDeadline[] = [
  { label: '5 Minutes', value: ms`5m` },
  { label: '30 Minutes', value: ms`30m` },
  DEFAULT_ORDER_DEADLINE,
  { label: '1 Day', value: ms`1d` },
  { label: '3 Days', value: ms`3d` },
  { label: '7 Days', value: ms`7d` },
  { label: '1 Month', value: ms`30d` },
]

export const TWAP_ORDER_STRUCT =
  'tuple(address sellToken,address buyToken,address receiver,uint256 partSellAmount,uint256 minPartLimit,uint256 t0,uint256 n,uint256 t,uint256 span,bytes32 appData)'

const twapHandlerAddress = '0x910d00a310f7Dc5B29FE73458F47f519be547D3d'
export const TWAP_HANDLER_ADDRESS: Record<SupportedChainId, string> = {
  1: twapHandlerAddress,
  100: twapHandlerAddress,
  5: twapHandlerAddress,
}

export const TWAP_PENDING_STATUSES = [TwapOrderStatus.WaitSigning, TwapOrderStatus.Pending, TwapOrderStatus.Scheduled]

export const MINIMUM_PART_SELL_AMOUNT_FIAT: Record<SupportedChainId, CurrencyAmount<Currency>> = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 5_000e6), // 5k
  [SupportedChainId.GOERLI]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GOERLI], 100e6), // 100
  [SupportedChainId.GNOSIS_CHAIN]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GNOSIS_CHAIN], 5e6), // 5
}

export const MINIMUM_PART_TIME = ms`5min` / 1000 // in seconds
