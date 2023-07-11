import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { USDC } from 'legacy/constants/tokens'

import { TwapOrderExecutionInfo, TwapOrderStatus } from './types'

export const DEFAULT_TWAP_SLIPPAGE = new Percent(10, 100) // 10%

export type OrderDeadline = { label: string; value: number }

export const DEFAULT_NUM_OF_PARTS = 2

export const DEFAULT_ORDER_DEADLINE: OrderDeadline = { label: '1 Hour', value: ms`1 hour` }

export const ORDER_DEADLINES: OrderDeadline[] = [
  DEFAULT_ORDER_DEADLINE,
  { label: '6 Hours', value: ms`6 hour` },
  { label: '12 Hours', value: ms`12 hour` },
  { label: '24 Hours', value: ms`1d` },
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

export const TWAP_CANCELLED_STATUSES = [TwapOrderStatus.Cancelling, TwapOrderStatus.Cancelled]

export const TWAP_FINAL_STATUSES = [TwapOrderStatus.Fulfilled, TwapOrderStatus.Expired, TwapOrderStatus.Cancelled]

export const MINIMUM_PART_SELL_AMOUNT_FIAT: Record<SupportedChainId, CurrencyAmount<Currency>> = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 5_000e6), // 5k
  [SupportedChainId.GOERLI]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GOERLI], 100e6), // 100
  [SupportedChainId.GNOSIS_CHAIN]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GNOSIS_CHAIN], 5e6), // 5
}

export const MINIMUM_PART_TIME = ms`5min` / 1000 // in seconds

export const DEFAULT_TWAP_EXECUTION_INFO: TwapOrderExecutionInfo = {
  executedSellAmount: '0',
  executedBuyAmount: '0',
  executedFeeAmount: '0',
}
