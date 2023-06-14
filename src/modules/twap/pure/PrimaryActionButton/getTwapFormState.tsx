import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'

export interface TwapFormStateParams {
  isSafeApp: boolean
  verification: ExtensibleFallbackVerification | null
}

export enum TwapFormState {
  LOADING_SAFE_INFO,
  NOT_SAFE,
  NEED_FALLBACK_HANDLER,
}

export function getTwapFormState(props: TwapFormStateParams): TwapFormState | null {
  const { isSafeApp, verification } = props

  if (!isSafeApp) return TwapFormState.NOT_SAFE

  if (verification === null) return TwapFormState.LOADING_SAFE_INFO

  if (verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER) {
    return TwapFormState.NEED_FALLBACK_HANDLER
  }

  return null
}
