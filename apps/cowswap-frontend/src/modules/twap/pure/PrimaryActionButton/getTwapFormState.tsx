import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import type { TradeFormValidationContext } from 'modules/tradeFormValidation'
import { getIsXstockTradeBelowLimit } from 'modules/tradeFormValidation/services/getIsXstockTradeBelowLimit'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { isPartTimeIntervalTooLong } from '../../utils/isPartTimeIntervalTooLong'
import { isPartTimeIntervalTooShort } from '../../utils/isPartTimeIntervalTooShort'
import { isSellAmountTooSmall } from '../../utils/isSellAmountTooSmall'

export interface TwapFormStateParams {
  isTxBundlingSupported: boolean | null
  verification: ExtensibleFallbackVerification | null
  sellAmountPartFiat: Nullish<CurrencyAmount<Currency>>
  chainId: SupportedChainId | undefined
  partTime: number | undefined
  numberOfPartsValue: number
  tradeFormValidationContext: TradeFormValidationContext | null
  isTwapEoaEnabled: boolean
  isSafeApp: boolean | null
  isEoa: boolean | null
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
    isTxBundlingSupported,
    verification,
    sellAmountPartFiat,
    chainId,
    partTime,
    tradeFormValidationContext,
    numberOfPartsValue,
    isTwapEoaEnabled,
    isSafeApp,
    isEoa,
    isReceiveZeroFromNetworkCosts,
  } = props

  if (isSafeApp === null) return TwapFormState.LOADING_SAFE_INFO

  if (isSafeApp) {
    if (isTxBundlingSupported === false) return TwapFormState.TX_BUNDLING_NOT_SUPPORTED

    if (verification === null || isTxBundlingSupported === null) {
      return TwapFormState.LOADING_SAFE_INFO
    }
  } else {
    if (!isTwapEoaEnabled || isEoa === false) return TwapFormState.WALLET_NOT_SUPPORTED
    if (isEoa === null) return TwapFormState.LOADING_SAFE_INFO
  }

  if (isSellAmountTooSmall(sellAmountPartFiat, chainId)) {
    return TwapFormState.SELL_AMOUNT_TOO_SMALL
  }

  if (isReceiveZeroFromNetworkCosts) {
    return TwapFormState.RECEIVE_ZERO_FROM_NETWORK_COSTS
  }

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
