import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'

export interface TwapFormStateParams {
  isSafeApp: boolean
  isFallbackHandlerSetupAccepted: boolean
  verification: ExtensibleFallbackVerification | null
  twapOrder: TWAPOrder | null
}

export enum TwapFormState {
  LOADING_SAFE_INFO = 'LOADING_SAFE_INFO',
  NOT_SAFE = 'NOT_SAFE',
  NEED_FALLBACK_HANDLER = 'NEED_FALLBACK_HANDLER',
}

export function getTwapFormState(props: TwapFormStateParams): TwapFormState | null {
  const { twapOrder, isSafeApp, isFallbackHandlerSetupAccepted, verification } = props

  if (!isSafeApp) return TwapFormState.NOT_SAFE

  if (verification === null) return TwapFormState.LOADING_SAFE_INFO

  if (
    twapOrder &&
    verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER &&
    !isFallbackHandlerSetupAccepted
  ) {
    return TwapFormState.NEED_FALLBACK_HANDLER
  }

  return null
}
