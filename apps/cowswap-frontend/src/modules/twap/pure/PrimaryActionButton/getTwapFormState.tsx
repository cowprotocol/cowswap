import { isFractionFalsy } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'
import { isPartTimeIntervalTooLong } from '../../utils/isPartTimeIntervalTooLong'
import { isPartTimeIntervalTooShort } from '../../utils/isPartTimeIntervalTooShort'
import { isSellAmountTooSmall } from '../../utils/isSellAmountTooSmall'

export interface TwapFormStateParams {
  isTxBundlingSupported: boolean | null
  verification: ExtensibleFallbackVerification | null
  twapOrder: TWAPOrder | null
  sellAmountPartFiat: Nullish<CurrencyAmount<Currency>>
  chainId: SupportedChainId | undefined
  partTime: number | undefined
}

export enum TwapFormState {
  LOADING_SAFE_INFO = 'LOADING_SAFE_INFO',
  TX_BUNDLING_NOT_SUPPORTED = 'TX_BUNDLING_NOT_SUPPORTED',
  SELL_AMOUNT_TOO_SMALL = 'SELL_AMOUNT_TOO_SMALL',
  PART_TIME_INTERVAL_TOO_SHORT = 'PART_TIME_INTERVAL_TOO_SHORT',
  PART_TIME_INTERVAL_TOO_LONG = 'PART_TIME_INTERVAL_TOO_LONG',
}

export function getTwapFormState(props: TwapFormStateParams): TwapFormState | null {
  const { twapOrder, isTxBundlingSupported, verification, sellAmountPartFiat, chainId, partTime } = props

  if (isTxBundlingSupported === false) return TwapFormState.TX_BUNDLING_NOT_SUPPORTED

  if (verification === null || isTxBundlingSupported === null) return TwapFormState.LOADING_SAFE_INFO

  if (!isFractionFalsy(twapOrder?.buyAmount) && isSellAmountTooSmall(sellAmountPartFiat, chainId)) {
    return TwapFormState.SELL_AMOUNT_TOO_SMALL
  }

  // Not using `twapOrder.timeInterval` because it's not filled until the order is ready
  if (isPartTimeIntervalTooShort(partTime)) {
    return TwapFormState.PART_TIME_INTERVAL_TOO_SHORT
  }
  if (isPartTimeIntervalTooLong(partTime)) {
    return TwapFormState.PART_TIME_INTERVAL_TOO_LONG
  }

  return null
}
