import { Dispatch, RefObject, SetStateAction, useEffect } from 'react'

import { TURNSTILE_DEMO_INTERACTIVE_SITE_KEY, TURNSTILE_SITE_KEY } from '../config/captcha.const'
import { logCaptcha } from '../logger'

interface UseCaptchaDebugControlsParams {
  exchangeRequestIdRef: RefObject<number>
  setCaptchaJwt: (token: string | null) => void
  setSiteKey: Dispatch<SetStateAction<string>>
}

declare global {
  interface Window {
    useDemoInteractiveCaptchaKey?: () => void
    resetCaptchaKey?: () => void
  }
}

export function useCaptchaDebugControls({
  exchangeRequestIdRef,
  setCaptchaJwt,
  setSiteKey,
}: UseCaptchaDebugControlsParams): void {
  useEffect(() => {
    window.useDemoInteractiveCaptchaKey = () => {
      logCaptcha('Switching to demo interactive site key')
      exchangeRequestIdRef.current += 1
      setCaptchaJwt(null)
      setSiteKey(TURNSTILE_DEMO_INTERACTIVE_SITE_KEY)
    }

    window.resetCaptchaKey = () => {
      logCaptcha('Resetting captcha site key')
      exchangeRequestIdRef.current += 1
      setCaptchaJwt(null)
      setSiteKey(TURNSTILE_SITE_KEY)
    }

    return () => {
      delete window.useDemoInteractiveCaptchaKey
      delete window.resetCaptchaKey
    }
  }, [exchangeRequestIdRef, setCaptchaJwt, setSiteKey])
}
