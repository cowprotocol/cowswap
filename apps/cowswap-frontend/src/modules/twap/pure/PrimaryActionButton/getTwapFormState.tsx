import { isFractionFalsy } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import type { TradeFormValidationContext } from 'modules/tradeFormValidation'
import { getIsXstockTradeBelowLimit } from 'modules/tradeFormValidation/services/getIsXstockTradeBelowLimit'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'
import { isPartTimeIntervalTooLong } from '../../utils/isPartTimeIntervalTooLong'
import { isPartTimeIntervalTooShort } from '../../utils/isPartTimeIntervalTooShort'
import { isSellAmountTooSmall } from '../../utils/isSellAmountTooSmall'

export interface TwapFormStateParams {
  isWalletSupported: boolean | null
  isTxBundlingSupported: boolean | null
  verification: ExtensibleFallbackVerification | null
  twapOrder: TWAPOrder | null
  sellAmountPartFiat: Nullish<CurrencyAmount<Currency>>
  chainId: SupportedChainId | undefined
  partTime: number | undefined
  numberOfPartsValue: number
  tradeFormValidationContext: TradeFormValidationContext | null
  isTwapEoaEnabled: boolean
  isSafeViaWc: boolean | null
  isReceiveZeroFromNetworkCosts: boolean
}

export enum TwapFormState {
  LOADING_SAFE_INFO = 'LOADING_SAFE_INFO',
  WALLET_NOT_SUPPORTED = 'WALLET_NOT_SUPPORTED',
  TX_BUNDLING_NOT_SUPPORTED = 'TX_BUNDLING_NOT_SUPPORTED',
  SELL_AMOUNT_TOO_SMALL = 'SELL_AMOUNT_TOO_SMALL',
  RECEIVE_ZERO_FROM_NETWORK_COSTS = 'RECEIVE_ZERO_FROM_NETWORK_COSTS',
  PART_TIME_INTERVAL_TOO_SHORT = 'PART_TIME_INTERVAL_TOO_SHORT',
  PART_TIME_INTERVAL_TOO_LONG = 'PART_TIME_INTERVAL_TOO_LONG',
  X_STOCK_MIN_TRADE_SIZE = 'X_STOCK_MIN_TRADE_SIZE',
}

export function getTwapFormState(props: TwapFormStateParams): TwapFormState | null {
  const {
    isWalletSupported,
    twapOrder,
    isTxBundlingSupported,
    verification,
    sellAmountPartFiat,
    chainId,
    partTime,
    tradeFormValidationContext,
    numberOfPartsValue,
    isTwapEoaEnabled,
    isSafeViaWc,
    isReceiveZeroFromNetworkCosts,
  } = props

  // When TWAP for EOA is enabled, skip Safe/tx-bundling checks so EOAs can review and confirm.
  // Keep the checks while Safe-via-WC is true or still loading (null), so it is not treated as an EOA.
  if (!isTwapEoaEnabled || isSafeViaWc !== false) {
    if (isWalletSupported === false) return TwapFormState.WALLET_NOT_SUPPORTED
    if (isTxBundlingSupported === false) return TwapFormState.TX_BUNDLING_NOT_SUPPORTED

    if (verification === null || isTxBundlingSupported === null || isWalletSupported === null) {
      return TwapFormState.LOADING_SAFE_INFO
    }
  }

  // A zero buy from a missing quote must not block the button. A zero buy because network
  // costs consumed a positive quote should. The fiat-minimum warning only applies when the
  // part is actually under that minimum.
  const partVolumeTooSmall = isSellAmountTooSmall(sellAmountPartFiat, chainId)
  const hasQuotedBuy = !isFractionFalsy(twapOrder?.buyAmount) || isReceiveZeroFromNetworkCosts

  if (hasQuotedBuy && partVolumeTooSmall) {
    return TwapFormState.SELL_AMOUNT_TOO_SMALL
  }

  if (isReceiveZeroFromNetworkCosts) {
    return TwapFormState.RECEIVE_ZERO_FROM_NETWORK_COSTS
  }

  // Not using `twapOrder.timeInterval` because it's not filled until the order is ready
  if (isPartTimeIntervalTooShort(partTime)) {
    return TwapFormState.PART_TIME_INTERVAL_TOO_SHORT
  }
  if (isPartTimeIntervalTooLong(partTime)) {
    return TwapFormState.PART_TIME_INTERVAL_TOO_LONG
  }

  if (tradeFormValidationContext) {
    const isXstockTradeBelowLimit = getIsXstockTradeBelowLimit(tradeFormValidationContext, numberOfPartsValue)

    if (isXstockTradeBelowLimit) return TwapFormState.X_STOCK_MIN_TRADE_SIZE
  }

  return null
}
