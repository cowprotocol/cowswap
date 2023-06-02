import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'

export interface TwapFormStateParams {
  isSafeApp: boolean
  verification: ExtensibleFallbackVerification | null
  twapOrder: TWAPOrder | null
}

export enum TwapFormState {
  LOADING_SAFE_INFO,
  NOT_SAFE,
  ORDER_NOT_SPECIFIED, // TODO: reveal details
  NEED_FALLBACK_HANDLER,
  CAN_CREATE_ORDER,
}

export function getTwapFormState(props: TwapFormStateParams): TwapFormState | null {
  const { isSafeApp, verification, twapOrder } = props

  if (!isSafeApp) return TwapFormState.NOT_SAFE

  if (verification === null) return TwapFormState.LOADING_SAFE_INFO

  if (!twapOrder) return TwapFormState.ORDER_NOT_SPECIFIED

  if (verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER) {
    return TwapFormState.NEED_FALLBACK_HANDLER
  }

  return null
}
