import { USDC } from '@cowprotocol/common-const'
import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

import { TwapOrderExecutionInfo, TwapOrderStatus } from './types'

export const DEFAULT_TWAP_SLIPPAGE = new Percent(10, 100) // 10%

export const MAX_TWAP_SLIPPAGE = 100 // 100%

export type OrderDeadline = { label: string; value: number }

export const DEFAULT_NUM_OF_PARTS = 2

export const DEFAULT_ORDER_DEADLINE: OrderDeadline = { label: '1 Hour', value: ms`1 hour` }

export const ORDER_DEADLINES: OrderDeadline[] = [
  DEFAULT_ORDER_DEADLINE,
  { label: '6 Hours', value: ms`6 hour` },
  { label: '12 Hours', value: ms`12 hour` },
  { label: '24 Hours', value: ms`1d` },
  { label: '1 Week', value: ms`1d` * 7 },
  { label: '1 Month', value: ms`1d` * 30 },
]

export const TWAP_ORDER_STRUCT =
  'tuple(address sellToken,address buyToken,address receiver,uint256 partSellAmount,uint256 minPartLimit,uint256 t0,uint256 n,uint256 t,uint256 span,bytes32 appData)'

const twapHandlerAddress = '0x6cF1e9cA41f7611dEf408122793c358a3d11E5a5'
export const TWAP_HANDLER_ADDRESS: Record<SupportedChainId, string> = mapAddressToSupportedNetworks(twapHandlerAddress)

export const TWAP_PENDING_STATUSES = [TwapOrderStatus.WaitSigning, TwapOrderStatus.Pending, TwapOrderStatus.Cancelling]

export const TWAP_FINAL_STATUSES = [TwapOrderStatus.Fulfilled, TwapOrderStatus.Expired, TwapOrderStatus.Cancelled]

export const MINIMUM_PART_SELL_AMOUNT_FIAT: Record<SupportedChainId, CurrencyAmount<Currency>> = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 5_000e6), // 5k
  [SupportedChainId.SEPOLIA]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.SEPOLIA], 100e6), // 100
  [SupportedChainId.GNOSIS_CHAIN]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GNOSIS_CHAIN], 5e6), // 5
}

export const MINIMUM_PART_TIME = ms`5min` / 1000 // in seconds
export const MAX_PART_TIME = MAX_ORDER_DEADLINE / 1000 // in seconds

export const DEFAULT_TWAP_EXECUTION_INFO: TwapOrderExecutionInfo = {
  executedSellAmount: '0',
  executedBuyAmount: '0',
  executedFeeAmount: '0',
}

export const UNSUPPORTED_SAFE_LINK =
  'https://blog.cow.fi/all-you-need-to-know-about-cow-swaps-new-safe-fallback-handler-8ef0439925d1'
export const UNSUPPORTED_WALLET_LINK =
  'https://blog.cow.fi/how-to-use-cow-swaps-twap-orders-via-safe-wallet-1a0854484dfb'
export const TWAP_LEARN_MORE_LINK = 'https://blog.cow.fi/cow-swap-launches-twap-orders-d5583135b472'
