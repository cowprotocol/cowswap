import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'
import { isSellAmountTooSmall } from '../../utils/isSellAmountTooSmall'

export interface TwapFormStateParams {
  isSafeApp: boolean
  isFallbackHandlerSetupAccepted: boolean
  verification: ExtensibleFallbackVerification | null
  twapOrder: TWAPOrder | null
  sellAmountPartFiat: Nullish<CurrencyAmount<Currency>>
  chainId: SupportedChainId | undefined
}

export enum TwapFormState {
  LOADING_SAFE_INFO = 'LOADING_SAFE_INFO',
  NOT_SAFE = 'NOT_SAFE',
  NEED_FALLBACK_HANDLER = 'NEED_FALLBACK_HANDLER',
  ACCEPTED_FALLBACK_HANDLER_SETUP = 'ACCEPTED_FALLBACK_HANDLER_SETUP',
  SELL_AMOUNT_TOO_SMALL = 'SELL_AMOUNT_TOO_SMALL',
}

export const NEED_FALLBACK_HANDLER_STATES = [
  TwapFormState.NEED_FALLBACK_HANDLER,
  TwapFormState.ACCEPTED_FALLBACK_HANDLER_SETUP,
]

export function getTwapFormState(props: TwapFormStateParams): TwapFormState | null {
  const { twapOrder, isSafeApp, isFallbackHandlerSetupAccepted, verification, sellAmountPartFiat, chainId } = props

  if (!isSafeApp) return TwapFormState.NOT_SAFE

  if (verification === null) return TwapFormState.LOADING_SAFE_INFO

  if (twapOrder && verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER) {
    if (isFallbackHandlerSetupAccepted) {
      return TwapFormState.ACCEPTED_FALLBACK_HANDLER_SETUP
    }

    return TwapFormState.NEED_FALLBACK_HANDLER
  }

  if (isSellAmountTooSmall(sellAmountPartFiat, chainId)) {
    return TwapFormState.SELL_AMOUNT_TOO_SMALL
  }

  return null
}
