import { USDC } from '@cowprotocol/common-const'
import { mapAddressToSupportedNetworks, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import ms from 'ms.macro'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

import { TwapOrderExecutionInfo, TwapOrderStatus } from './types'

export const DEFAULT_TWAP_SLIPPAGE = new Percent(10, 100) // 10%

export const MAX_TWAP_SLIPPAGE = 99.99 // 99.99%

export type OrderDeadline = { label: MessageDescriptor; value: number }

export const DEFAULT_NUM_OF_PARTS = 2

export const DEFAULT_ORDER_DEADLINE: OrderDeadline = { label: msg`1 Hour`, value: ms`1 hour` }

export const ORDER_DEADLINES: OrderDeadline[] = [
  DEFAULT_ORDER_DEADLINE,
  { label: msg`6 Hours`, value: ms`6 hour` },
  { label: msg`12 Hours`, value: ms`12 hour` },
  { label: msg`24 Hours`, value: ms`1d` },
  { label: msg`1 Week`, value: ms`1d` * 7 },
  { label: msg`1 Month`, value: ms`1d` * 30 },
]

export const TWAP_ORDER_STRUCT = [
  {
    type: 'tuple',
    components: [
      { name: 'sellToken', type: 'address' },
      { name: 'buyToken', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'partSellAmount', type: 'uint256' },
      { name: 'minPartLimit', type: 'uint256' },
      { name: 't0', type: 'uint256' },
      { name: 'n', type: 'uint256' },
      { name: 't', type: 'uint256' },
      { name: 'span', type: 'uint256' },
      { name: 'appData', type: 'bytes32' },
    ],
  },
] as const

const twapHandlerAddress = '0x6cF1e9cA41f7611dEf408122793c358a3d11E5a5'
export const TWAP_HANDLER_ADDRESS: Record<SupportedChainId, string> = mapAddressToSupportedNetworks(twapHandlerAddress)

export const TWAP_PENDING_STATUSES = [TwapOrderStatus.WaitSigning, TwapOrderStatus.Pending, TwapOrderStatus.Cancelling]

export const TWAP_FINAL_STATUSES = [TwapOrderStatus.Fulfilled, TwapOrderStatus.Expired, TwapOrderStatus.Cancelled]

export const MINIMUM_PART_SELL_AMOUNT_FIAT: Record<SupportedChainId, CurrencyAmount<Currency>> = {
  ...mapSupportedNetworks((chainId: SupportedChainId) => CurrencyAmount.fromRawAmount(USDC[chainId], 1e6)), // 1$ for most chains
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 1_000e6), // 1k for mainnet
  [SupportedChainId.SEPOLIA]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.SEPOLIA], 10e18), // 10 for sepolia
  [SupportedChainId.BNB]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.BNB], 1e18), // 1 for BNB, but it has 18 decimals!
}

export const MINIMUM_PART_TIME = ms`5min` / 1000 // in seconds
export const MAX_PART_TIME = MAX_ORDER_DEADLINE / 1000 // in seconds

export const DEFAULT_TWAP_EXECUTION_INFO: TwapOrderExecutionInfo = {
  executedSellAmount: '0',
  executedBuyAmount: '0',
  executedFeeAmount: '0',
}

export const DEFAULT_TWAP_EXECUTION = { confirmedPartsCount: 0, info: DEFAULT_TWAP_EXECUTION_INFO }

export const UNSUPPORTED_SAFE_LINK =
  'https://cow.fi/learn/all-you-need-to-know-about-cow-swap-new-safe-fallback-handler'
export const UNSUPPORTED_WALLET_LINK = 'https://cow.fi/learn/how-to-use-cow-swap-twap-orders-via-safe-wallet'
export const TWAP_LEARN_MORE_LINK = 'https://cow.fi/learn/cow-swap-launches-twap-orders'
